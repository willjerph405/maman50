import random
import string
import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Guest(models.Model):
    SINGLE = "single"
    COUPLE = "couple"

    TICKET_TYPES = [
        (SINGLE, "Single"),
        (COUPLE, "Couple"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    display_name = models.CharField(
        max_length=255,
        verbose_name="Nom affiché",
    )

    slug = models.SlugField(
        unique=True,
        max_length=300,
        blank=True,
    )

    ticket_type = models.CharField(
        max_length=20,
        choices=TICKET_TYPES,
        default=SINGLE,
    )

    places = models.PositiveIntegerField(default=1)

    phone = models.CharField(
        max_length=30,
        blank=True,
        null=True,
    )

    email = models.EmailField(
        blank=True,
        null=True,
    )

    table_number = models.PositiveIntegerField(
        blank=True,
        null=True,
    )

    qr_code = models.CharField(
        max_length=255,
        blank=True,
        unique=True,
    )

    invitation_url = models.URLField(
        blank=True,
        null=True,
    )

    is_checked_in = models.BooleanField(default=False)

    checked_in_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="created_guests",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["display_name"]
        verbose_name = "Invité"
        verbose_name_plural = "Invités"

    def generate_code(self):
        return "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=8,
            )
        )

    def save(self, *args, **kwargs):
        if self.ticket_type == self.COUPLE:
            self.places = 2
        else:
            self.places = 1

        if not self.slug:
            base_slug = slugify(self.display_name)
            slug = base_slug
            i = 1

            while Guest.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{i}"
                i += 1

            self.slug = slug

        if not self.qr_code:
            code = self.generate_code()

            while Guest.objects.filter(qr_code=code).exists():
                code = self.generate_code()

            self.qr_code = code

        super().save(*args, **kwargs)

        invitation = f"http://localhost:5174/guests/{self.slug}"

        if self.invitation_url != invitation:
            self.invitation_url = invitation
            super().save(update_fields=["invitation_url"])

    def __str__(self):
        return (
            f"{self.display_name} "
            f"({self.places} place{'s' if self.places > 1 else ''})"
        )