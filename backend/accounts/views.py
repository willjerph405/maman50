from django.contrib.auth.models import User
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class AdminSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "role",
            "date_joined",
            "last_login",
        ]

    def get_role(self, obj):
        return "super_admin" if obj.is_superuser else "admin"


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(AdminSerializer(request.user).data)


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def admins(request):
    if not request.user.is_superuser:
        return Response(
            {"detail": "Accès réservé au Super Admin."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        users = User.objects.filter(is_staff=True).order_by("-date_joined")
        return Response(AdminSerializer(users, many=True).data)

    if request.method == "POST":
        username = request.data.get("username")
        email = request.data.get("email", "")
        password = request.data.get("password")
        role = request.data.get("role", "admin")

        if not username or not password:
            return Response(
                {"detail": "Username et mot de passe obligatoires."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Ce nom utilisateur existe déjà."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        user.is_staff = True
        user.is_superuser = role == "super_admin"
        user.save()

        return Response(AdminSerializer(user).data, status=status.HTTP_201_CREATED)

    if request.method == "DELETE":
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"detail": "Aucun administrateur sélectionné."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.id in ids:
            return Response(
                {"detail": "Tu ne peux pas supprimer ton propre compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = User.objects.filter(id__in=ids, is_staff=True)

        deleted_count = users.count()
        users.delete()

        return Response({
            "detail": f"{deleted_count} administrateur(s) supprimé(s)."
        })