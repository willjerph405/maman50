from django.urls import path
from .views import me, admins

urlpatterns = [
    path("me/", me),
    path("admins/", admins),
]