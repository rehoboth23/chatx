import re
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class ChatUserManager(BaseUserManager):
    def create_user(self, email=None, password=None, name=None):
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            password=password,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email=None, password=None, name=None):
        user = self.create_user(
            email=email,
            password=password,
            name=name,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


# Create your models here.
class ChatUser(AbstractUser):
    username = None
    first_name = None
    last_name = None
    name = models.CharField(max_length=500)
    email = models.EmailField(verbose_name='email', unique=True, max_length=60)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    phone = models.IntegerField(null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    isOnline = models.BooleanField(default=False)
    profile_pic = models.ImageField(upload_to=f"profile-pics", verbose_name="Profile Pic", null=True,
                                    default="profile-pics/default.jpeg")
    cover_pic = models.ImageField(upload_to=f"cover", verbose_name="Cover Pic", null=True, default="cover/default.jpeg")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = ChatUserManager()

    def __str__(self):
        return self.name

    def set_name(self, name):
        self.name = name

    def set_email(self, email):
        self.email = email

    def set_age(self, age):
        self.age = int(age)

    def set_gender(self, gender):
        self.gender = gender

    def set_phone(self, phone):
        self.phone = int(phone)

    def set_address(self, address):
        self.address = address

    def set_pic(self, img):
        try:
            cleaned_path = img.split("media")[1][1:]
            self.profile_pic = cleaned_path
        except:
            self.profile_pic = img
            self.save()

    def get_name(self):
        return self.name

    def get_email(self):
        return str(self.email)

    def changeState(self, **kwargs):
        action = kwargs.get('action')
        if action == 'logout':
            self.isOnline = False
        elif action == 'login':
            self.isOnline = True
        else:
            self.isOnline = not self.isOnline
        self.save()

    def status(self):
        return self.isOnline

    def search_for(self, string):
        return string in self.get_email() or string in self.get_name()

    def isEqual(self, oUser):
        return oUser.email == self.email


class ChatRoom(models.Model):
    roomName1 = models.CharField(max_length=5000)
    roomName2 = models.CharField(max_length=5000)
    roomUsers = models.CharField(max_length=5000)
    chatId = models.IntegerField(default="0")
    mostRecent = models.IntegerField(default="0", null=True)

    def check_name(self, **kwargs):
        room_name = self.staticRoomName(kwargs.get("users")) if kwargs.get("users") else kwargs.get("room_name")
        return room_name == self.roomName1 or room_name == self.roomName2

    @staticmethod
    def staticRoomName(users):
        _room_name = ""
        for user in users:
            _room_name += f"{user.id}_{user.get_email()}_"

        return _room_name

    @staticmethod
    def compare_to(o1, o2):
        o1_recent = int(o1.mostRecent)
        o2_recent = int(o2.mostRecent)
        if o1_recent > o2_recent:
            return 1
        if o1_recent < o2_recent:
            return -1
        return 0


class Chat(models.Model):
    _memo = models.CharField(max_length=2000)
    _User = models.ForeignKey(ChatUser, related_name="Sender", on_delete=models.CASCADE)
    _Receiver = models.ForeignKey(ChatUser, related_name="Receiver", on_delete=models.CASCADE)
    _date = models.DateTimeField(auto_now_add=True)
    room = models.ForeignKey(ChatRoom, related_name="Room", on_delete=models.CASCADE)
    residentRoom = models.CharField(blank=True, max_length=5000)
    residentRoomId = models.CharField(blank=True, max_length=5000)

    @property
    def memo(self):
        return self._memo

    @property
    def User(self):
        return self._User.get_email()

    @property
    def Receiver(self):
        return self._Receiver.get_email()

    @property
    def date(self):
        return self._date

    @staticmethod
    def search(main_user, key):
        matches = []
        if key:
            pseudo_pattern = r"" + key.replace('@', '_').lower()
            for user in ChatUser.objects.all():
                name = user.get_name().lower()
                email = user.get_email().replace('@', '_').lower()
                if (re.match(pseudo_pattern, name) or re.match(pseudo_pattern,
                                                               email)) and user.get_email() != main_user:
                    matches.append({
                        'name': user.get_name(),
                        'email': user.get_email(),
                        'pic_url': "static/" + str(user.profile_pic)
                    })
        return matches
