from rest_framework import serializers

from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Guest
        fields = [
            "id",
            "display_name",
            "slug",
            "ticket_type",
            "places",
            "phone",
            "email",
            "table_number",
            "qr_code",
            "invitation_url",
            "is_checked_in",
            "checked_in_at",
            "notes",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "places",
            "qr_code",
            "invitation_url",
            "is_checked_in",
            "checked_in_at",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

    def get_created_by_username(self, obj):
        if obj.created_by:
            return obj.created_by.username

        return "Non renseigné"