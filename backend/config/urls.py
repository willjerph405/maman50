from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def home(request):
    return JsonResponse(
        {
            "application": "KENNE Hortance",
            "version": "1.0.0",
            "status": "online",
        }
    )


urlpatterns = [
    # Page d'accueil API
    path("", home),

    # Administration Django
    path("admin/", admin.site.urls),

    # API Invités
    path("api/", include("guests.urls")),

    # Profil utilisateur connecté
    path("api/auth/", include("accounts.urls")),

    # Authentification JWT
    path(
        "api/auth/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]