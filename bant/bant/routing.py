from django.conf.urls import url
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from chatApi import routing


# application = ProtocolTypeRouter({
#
#     # WebSocket chat handler
#     "websocket": AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#                 URLRouter([
#                     url('', MessageConsumer)
#                 ]
#             )
#         )
#     )
# })

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})