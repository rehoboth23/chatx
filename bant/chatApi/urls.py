from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, ChatRoomView, UserViewSet
from rest_framework.authtoken import views
from .consumers import MessageConsumer

CHAT_ROUTER = DefaultRouter()
CHAT_ROUTER.register('chats', ChatViewSet, basename='chats')

id_pattern= r"^rooms/(?P<id>[0-9]+)/$"
room_pattern = r"^rooms/(?P<roomName>[0-9]+_([\w]+@[\w]+[\.][\w]+)_[0-9]+_([\w]+@[\w]+[\.][\w]+)_)/$"
chat_pattern = r"^chats/(?P<roomName>[0-9]+_([\w]+@[\w]+[\.][\w]+)_[0-9]+_([\w]+@[\w]+[\.][\w]+)_)/$"


app_name = "chatApi"

urlpatterns = [
    path("", include(CHAT_ROUTER.urls)),
    re_path(chat_pattern, ChatViewSet.as_view({'get': 'list'})),
    path("rooms/", ChatRoomView.as_view({'get': 'list'}), name="rooms_name"),
    path("rooms/", ChatRoomView.as_view({'delete': 'destroy'}), name="rooms_name"),
    path("login/", views.obtain_auth_token, name="login-token"),
    path("authenticate/", UserViewSet.as_view(), name="signup")
]
