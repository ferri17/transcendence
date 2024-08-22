"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
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
from django.urls import path
from . import views
from . import login
# from . import friends
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("confirm_friends/", views.confirm_friends, name="confirm_friends"),
    path("add_friend/", views.add_friend, name="add_friend"),
    path("list_pending/", views.list_pending, name="list_pending"),
    path("list_friends/", views.list_friends, name="list_friends"),
    path('verify_token/', views.verify_token, name="verify_token"),
    path("info_user/", views.infoUser, name="info_user"),
    path("update_info_user/", views.updateInfoUser, name="update_info_user"),
    path("uidenv/", login.uidenv, name="uidenv"),
    path('loginIntra/', login.loginIntra, name='loginIntra'),
    path('insertlogin/', login.insertLogin, name='insertlogin'),
    path('checkLogin/', login.checkLogin, name='checkLogin'),
    path('protected_view/', views.protected_view, name='protected_view'),
    path('refreshToken/', login.refreshToken, name='refreshToken'),
    path('singUp/', login.singUp, name='singUp'),
    path('loginWeb/', login.loginWeb, name='loginWeb'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]