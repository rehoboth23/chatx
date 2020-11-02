import json, requests
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from .models import ChatUser, Chat, ChatRoom


PRELINK = "https://localhost:8000"
# PRELINK = "https://www.rehoboth.link"
IN_PROD = False

class MessageConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        self.email = ""
        self.channel_groups_names = {}
        await self.send({
            "type": "websocket.accept",
        })

    async def websocket_receive(self, event):
        info = json.loads(event["text"]) or None
        if info and info['type'] == "profile":
            try:
                data = info['data']
                token = info['token']
                context = {
                    "name": data['name'],
                    "email": data['email'],
                    "age": data['age'],
                    "phone": data['phone'],
                    "gender": data['gender'],
                    "address": data['address'],
                    "profilePicData": info['picUpload'],
                    "profilePicExtension": data['profilePicExtension']
                }
                response = await self.update_profile(token, context)
                object_res = json.loads(response.content)
                object_res['custom_type'] = 'profile'
                await self.send({
                    "type": "websocket.send",
                    "text": json.dumps(object_res)
                })
            except:
                pass

        if info and info["type"] == "search":
            matches = await self.get_matches(info['user'], info['key'])
            search_res = {'custom_type': 'search', 'matches': matches}
            await self.send({
                "type": "websocket.send",
                "text": json.dumps(search_res)
            })

        if info and info["type"] == "sub":
            room_names = [await self.get_room_name(name) for name in info['room_names']]
            try:
                name = await self.parse_name(info['email'])
                await self.get_status(info['email'])
                await self.channel_layer.group_add(
                    name,
                    self.channel_name
                )
            except:
                pass
            for room_name in room_names:
                if room_name and room_name not in self.channel_groups_names:
                    await self.channel_layer.group_add(
                        room_name,
                        self.channel_name
                    )
                    email = info['email']
                    status = await self.get_status(email)
                    auth_res = {'email': email, 'status': status, 'custom_type': 'auth'}
                    await self.channel_layer.group_send(
                        room_name,
                        {
                            "type": "msg",
                            "text": json.dumps(auth_res)
                        }
                    )
                    self.channel_groups_names[room_name] = 1
                else:
                    pass

        elif info and info["type"] == "auth":
            room_names = [await self.get_room_name(name) for name in info['room_names']]
            email = info["user"]
            await self.change_state(email)
            for room_name in room_names:
                email = info['user']
                status = await self.get_status(email)
                auth_res = {'user': email, 'status': status, 'custom_type': 'auth'}
                await self.channel_layer.group_send(
                    room_name,
                    {
                        "type": "msg",
                        "text": json.dumps(auth_res)
                    }
                )

        elif info and info["type"] == "message":
            room_name = await self.get_room_name(info["room_name"]) if not info["new"] \
                else await self.parse_name(info["room_name"])
            if room_name not in self.channel_groups_names:
                await self.channel_layer.group_add(
                    room_name,
                    self.channel_name
                )
            user = await self.get_user(info["User"])
            token_iter = await self.get_token(user)
            token = token_iter[0]
            response = await self.get_response(info, token)
            object_res = json.loads(response.content)
            object_res['custom_type'] = 'message'
            if response.status_code == 200:
                res_room = await self.standard_name(object_res['residentRoom'])
                object_res['residentRoom'] = res_room
            await self.channel_layer.group_send(
                room_name,
                {
                    "type": "msg",
                    "text": json.dumps(object_res)
                }
            )

    async def msg(self, event):
        await self.send({
            "type": "websocket.send",
            "text": event["text"]
        })

    async def websocket_disconnect(self, event):
        print("Chat Rest", event)

    async def parse_name(self, email):
        text = email.replace("@", "_").replace(".", "_")
        return text

    @database_sync_to_async
    def change_state(self, email):
        user = ChatUser.objects.filter(email=email)[0]
        user.changeState(action='logout')

    @database_sync_to_async
    def get_user(self, email):
        user = ChatUser.objects.filter(email=email)[0]
        return user

    @database_sync_to_async
    def get_matches(self, user, key):
        return Chat.search(user, key)

    @database_sync_to_async
    def get_status(self, email):
        user = ChatUser.objects.filter(email=email)[0]
        return user.status()

    @database_sync_to_async
    def standard_name(self, room_name):
        for x in ChatRoom.objects.all():
            if x.check_name(room_name=room_name):
                name = x['roomName1']
                return name

    @database_sync_to_async
    def get_room_name(self, room_name):
        for x in ChatRoom.objects.all():
            if x.check_name(room_name=room_name):
                name = x.roomName1
                sock_room_name = name.replace("@", "_").replace(".", "_")
                return sock_room_name

    @database_sync_to_async
    def get_token(self, user):
        token = Token.objects.get_or_create(user=user)
        return token

    @database_sync_to_async
    def get_response(self, info, token):
        raw_token = "Token " + str(token).strip()
        res = requests.post(f"{PRELINK}/chats/",
                            headers={"Authorization": raw_token},
                            data=json.dumps({
                                "User": info["User"],
                                "Receiver": info["Receiver"],
                                "memo": info["memo"]
                            }), verify=IN_PROD)
        return res

    @database_sync_to_async
    def update_profile(self, token, context):
        raw_token = "Token " + str(token).strip()
        res = requests.put(f"{PRELINK}/authenticate/",
                            headers={"Authorization": raw_token},
                            data=json.dumps(context), verify=IN_PROD)
        return res
