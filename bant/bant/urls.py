"""bant URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views
from .settings import MEDIA_ROOT, MEDIA_URL, STATICFILES_DIRS, STATIC_URL
from django.views.generic import TemplateView
from chatApi.views import redirectview

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', redirectview),
    path('', TemplateView.as_view(template_name="index.html")),
    path('', include('chatApi.urls')),
    path('chat/', TemplateView.as_view(template_name="index.html")),
    path('auth/', TemplateView.as_view(template_name="index.html")),
    path('profile/', TemplateView.as_view(template_name="index.html")),
    url(r'^rest-auth/', include('rest_auth.urls')),
    path("login/", views.obtain_auth_token, name="login-token"),
]

urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
urlpatterns += static(STATIC_URL, document_root=STATICFILES_DIRS)
