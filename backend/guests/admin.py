from django.contrib import admin
from .models import Guest


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "ticket_type",
        "places",
        "table_number",
        "is_checked_in",
        "created_at",
    )

    search_fields = (
        "display_name",
        "phone",
        "email",
    )

    list_filter = (
        "ticket_type",
        "is_checked_in",
    )