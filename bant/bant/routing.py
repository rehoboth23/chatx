from django.conf.urls import url
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from chatApi.consumers import MessageConsumer


application = ProtocolTypeRouter({

    # WebSocket chat handler
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
                URLRouter([
                    url('', MessageConsumer)
                ]
            )
        )
    )
})