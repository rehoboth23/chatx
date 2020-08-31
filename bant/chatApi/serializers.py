from rest_framework.serializers import ModelSerializer
from .models import Chat, ChatRoom, ChatUser


class UserSerializer(ModelSerializer):
    class Meta:
        model = ChatUser
        fields = [
            'email',
            'name',
            'age',
            'gender',
            'address',
            'profile_pic',
            'cover_pic',
            'phone',
        ]


class ChatSerializer(ModelSerializer):
    class Meta:
        model = Chat
        fields = [
            'id',
            'User',
            'Receiver',
            'memo',
            'date',
            'residentRoom',
            'residentRoomId',
        ]


class ChatRoomSerializer(ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'roomName1',
            'roomName2',
            'roomUsers',
        ]
