import base64
import os
import json
import requests
from django.shortcuts import get_object_or_404, redirect
from django.utils.html import strip_tags
from rest_framework.authtoken.models import Token
from bant.settings import AWS_STORAGE_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_REGION_NAME
from .forms import SignUpForm
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatUser
from .models import ChatRoom, Chat
from .serializers import ChatSerializer, ChatRoomSerializer, UserSerializer
from rest_framework import viewsets, status
import boto3
from .consumers import PRELINK


def redirectview(request):
    return redirect("/auth")


# Create your views here.
class UserViewSet(APIView):
    def get(self, request):
        try:
            raw_token = request.headers['Authorization'].split(" ")[1]
            user_id = Token.objects.get(key=raw_token).user_id
            user = ChatUser.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        body = json.loads(request.body)
        try:
            test = body["name"]
            form = SignUpForm(body)
            if form.is_valid():
                user = form.save()
                user.changeState()
                response = requests.post(f"{PRELINK}/login/",
                                         data={'username': body['email'], 'password': body['password1']})

                if response.status_code == 200:
                    user.changeState(action='login')
                    return Response(json.loads(response.content), status=status.HTTP_200_OK)
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
            else:
                emailErrors = []
                passwordErrors = []
                for field in form:
                    error = strip_tags(field.errors)
                    if 'email' in error.lower():
                        emailErrors.append(error)
                    if 'password' in error.lower():
                        passwordErrors.append(error)
                errors = {'email': emailErrors, 'password': passwordErrors}
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            response = requests.post(f"{PRELINK}/login/",
                                     data={'username': body['email'], 'password': body['password']})
            if response.status_code == 200:
                token = json.loads(response.content)["token"]
                user_id = Token.objects.get(key=token).user_id
                user = ChatUser.objects.get(id=user_id)
                user.changeState(action='login')
                return Response(json.loads(response.content), status=status.HTTP_200_OK)
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
            raw_token = request.headers['Authorization'].split(" ")[1]
            user_id = Token.objects.get(key=raw_token).user_id
            user = ChatUser.objects.get(id=user_id)
            data = json.loads(request.body)
            if data['name']:
                user.set_name(data['name'])
            if data['email']:
                user.set_email(data['email'])
            if data['age']:
                user.set_age(data['age'])
            if data['gender']:
                user.set_gender(data['gender'])
            if data['phone']:
                user.set_phone(data['phone'])
            if data['address']:
                user.set_address(data['address'])
            if data['profilePicData'] and data['profilePicExtension']:
                try:
                    email = user.get_email().replace("@", "-").replace(".", "-")
                    remote_filename = f"profile-pics/{email}.{data['profilePicExtension']}"
                    # local_filename = f"media/profile-pics/{email}.{data['profilePicExtension']}"
                    local_filename = f"/home/ubuntu/chatx/bant/{email}.{data['profilePicExtension']}"
                    file = open(local_filename, "wb+")
                    content = data['profilePicData'].split(";")[1]
                    image_encoded = content.split(',')[1]
                    body = base64.decodebytes(image_encoded.encode('utf-8'))
                    file.write(body)
                    file.close()
                    s3 = boto3.client('s3', region_name=AWS_S3_REGION_NAME, aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
                    with open(local_filename, "rb") as f:
                        s3.upload_fileobj(f, AWS_STORAGE_BUCKET_NAME, f"static/{remote_filename}")
                    os.remove(local_filename)
                    user.set_pic(f"{remote_filename}")
                except:
                    pass

            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        return Response(status=status.HTTP_400_BAD_REQUEST)


class ChatViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, **kwargs):
        room_name = kwargs.get("roomName")
        if room_name:
            response = {}
            a_room = None
            all_rooms = ChatRoom.objects.all()
            for room in all_rooms:
                if room_name == room.roomName1 or room_name == room.roomName2:
                    a_room = room
                    break
            if a_room:
                chats = []
                qset = Chat.objects.all()
                for chat in qset:
                    if chat.residentRoom == a_room.roomName1 or chat.residentRoom == a_room.roomName2:
                        serializer = ChatSerializer(chat)
                        response[chat.residentRoomId] = serializer.data
                return Response(response, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, pk):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        data = json.loads(request.body)
        serializer = ChatSerializer(data=data)
        try:
            serializer.is_valid()
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            User_Email = serializer.initial_data["User"]
            Receiver_Email = serializer.initial_data["Receiver"]
            Memo = serializer.initial_data["memo"]
            user = get_object_or_404(ChatUser, email=User_Email)
            receiver = get_object_or_404(ChatUser, email=Receiver_Email)
            room_name = ChatRoom.staticRoomName([user, receiver])
            room = None
            chat = Chat(_memo=Memo, _User=user, _Receiver=receiver)

            for x in ChatRoom.objects.all():
                if x.check_name(room_name=room_name):
                    room = x
                    break

            if room:
                chatId = int(room.chatId)
                room.chatId = f"{chatId + 1}"
                chat.residentRoom = room.roomName1
                chat.residentRoomId = chatId
                chat.room = room
                chat.save()


            else:
                room = ChatRoom()
                room.roomName1 = room_name
                room.roomName2 = ChatRoom.staticRoomName([receiver, user])
                room.roomUsers = json.dumps([User_Email, Receiver_Email])
                chatId = int(room.chatId)
                room.chatId = f"{chatId + 1}"
                room.save()
                chat.residentRoom = room.roomName1
                chat.residentRoomId = chatId
                chat.room = room
                chat.save()

            room.mostRecent = chat.id
            room.save()
            chat.save()

            serializer = ChatSerializer(chat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *pk):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk):
        chat = get_object_or_404(Chat, pk=pk)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatRoomView(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        raw_token = request.headers["Authorization"].split(" ")[1]
        user_id = Token.objects.get(key=raw_token).user_id
        user = ChatUser.objects.get(id=user_id)
        response = {}
        rooms = []
        user_rooms = get_user_rooms(user.get_email())
        for room in user_rooms:
            serializer = ChatRoomSerializer(room)
            room_data = serializer.data
            users = json.loads(room.roomUsers)
            other = users[0] if users[0] != user.get_email() else users[1]
            otr = list(ChatUser.objects.filter(email=other))
            if len(otr) > 0:
                room_data["other_name"] = get_object_or_404(ChatUser, email=other).get_name()
                room_data["other_email"] = get_object_or_404(ChatUser, email=other).get_email()
                room_data["other_status"] = get_object_or_404(ChatUser, email=other).status()
                room_data["other_profilepic"] = "https://test-mykc-bucket.s3.us-east-2.amazonaws.com/static/" + str(get_object_or_404(ChatUser, email=other).profile_pic)
            try:
                room_data["date"] = get_object_or_404(Chat, id=int(room.mostRecent)).date
            except:
                chats = list(Chat.objects.filter(room=room))
                if len(chats) > 0:
                    newMostRecent = chats[len(chats)-1]
                    room.mostRecent = newMostRecent.id
                    room_data["date"] = get_object_or_404(Chat, id=int(room.mostRecent)).date
                    room.save()
                else:
                    room.delete()

            rooms.append(room_data)
        response["rooms"] = rooms
        response["user"] = user.get_email()
        return Response(response, status=status.HTTP_200_OK)

    def retrieve(self, request, **kwargs):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, **kwargs):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, **kwargs):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, **kwargs):
        id = kwargs.get("id")
        room_name = kwargs.get("roomName")
        room = get_room(id=id, roomName=room_name)
        if room:
            room.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_400_BAD_REQUEST)


def get_room(**kwargs):
    id = kwargs.get("id")
    roomName = kwargs.get("roomName")
    if roomName:
        roomName = roomName.strip()
        for x in ChatRoom.objects.all():
            if x.check_name(room_name=roomName):
                return x
    elif id:
        id = id.strip()
        room = get_object_or_404(ChatRoom, pk=int(id))
        return room


def get_user_rooms(user_email):
    from .minPriotrityQueue import Queue
    sorted_rooms = Queue()
    rooms = ChatRoom.objects.all()
    filtered_rooms = filter(lambda room: user_email in json.loads(room.roomUsers), rooms)
    for room in filtered_rooms:
        sorted_rooms.insert(room, ChatRoom.compare_to)
    return sorted_rooms
