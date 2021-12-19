import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bant.settings")
django.setup()
import chatApi.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(chatApi.routing.websocket_urlpatterns)
        ),
})
