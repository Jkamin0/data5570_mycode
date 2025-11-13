from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HabitViewSet, HabitLogViewSet,
    register, login, logout, current_user
)

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'logs', HabitLogViewSet, basename='habitlog')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/user/', current_user, name='current-user'),
]
