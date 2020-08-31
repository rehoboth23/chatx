from django.contrib import admin
from .models import Chat, ChatUser, ChatRoom

# Register your models here.
admin.site.register(Chat)
admin.site.register(ChatRoom)
admin.site.register(ChatUser)
