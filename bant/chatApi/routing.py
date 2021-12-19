from .consumers import MessageConsumer
from django.urls import re_path

websocket_urlpatterns = [
    re_path(r'^ws', MessageConsumer.as_asgi()),
]
