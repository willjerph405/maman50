from io import BytesIO
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Guest
from .serializers import GuestSerializer


MAX_PLACES_PER_TABLE = 8


class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all().order_by("-created_at")
    serializer_class = GuestSerializer
    lookup_field = "slug"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def assign_table(self, request, slug=None):
        guest = self.get_object()
        table_number = request.data.get("table_number")

        if table_number in ["", None, "null"]:
            guest.table_number = None
            guest.save()
            return Response(GuestSerializer(guest).data)

        try:
            table_number = int(table_number)
        except ValueError:
            return Response(
                {"error": "Le numéro de table doit être un nombre."},
                status=400,
            )

        guest_places = 2 if guest.ticket_type == "couple" else 1

        guests_on_table = Guest.objects.filter(
            table_number=table_number
        ).exclude(id=guest.id)

        used_places = sum(
            2 if item.ticket_type == "couple" else 1
            for item in guests_on_table
        )

        if used_places + guest_places > MAX_PLACES_PER_TABLE:
            return Response(
                {
                    "error": (
                        f"Table {table_number} pleine. "
                        f"Capacité maximale : {MAX_PLACES_PER_TABLE} places."
                    )
                },
                status=400,
            )

        guest.table_number = table_number
        guest.save()

        return Response(GuestSerializer(guest).data)

    @action(detail=True, methods=["post"])
    def check_in(self, request, slug=None):
        guest = self.get_object()
        guest.is_checked_in = True
        guest.checked_in_at = timezone.now()
        guest.save()

        return Response(GuestSerializer(guest).data)

    @action(detail=True, methods=["get"])
    def pdf(self, request, slug=None):
        guest = get_object_or_404(Guest, slug=slug)

        W, H = 1240, 1754
        template_path = Path(settings.BASE_DIR) / "tickets" / "template.png"

        if template_path.exists():
            background = Image.open(template_path).convert("RGB")
            background = cover_image(background, W, H)
        else:
            background = Image.new("RGB", (W, H), "#F8F1DF")

        img = background.convert("RGBA")
        draw = ImageDraw.Draw(img)

        gold = "#C99A2E"
        gold_light = "#F6D98B"
        gold_dark = "#8B5E10"
        dark = "#111827"
        cream = "#FFF8E7"
        white = "#FFFFFF"

        img.alpha_composite(Image.new("RGBA", (W, H), (255, 245, 220, 28)))

        gradient = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(gradient)

        for y in range(H):
            if y > 600:
                alpha = int(min(135, (y - 600) / (H - 600) * 135))
                gd.line((0, y, W, y), fill=(255, 255, 255, alpha))

        img.alpha_composite(gradient)

        title_font = font("georgiab.ttf", 94)
        script_font = font("segoesc.ttf", 92)
        big_font = font("georgiab.ttf", 78)
        name_font = font("georgiab.ttf", 66)
        medium_font = font("georgiab.ttf", 34)
        medium_bold = font("arialbd.ttf", 32)
        small_bold = font("arialbd.ttf", 24)
        tiny = font("arial.ttf", 20)

        draw.rounded_rectangle((35, 35, W - 35, H - 35), radius=42, outline=gold, width=6)
        draw.rounded_rectangle((58, 58, W - 58, H - 58), radius=34, outline=gold_light, width=2)
        draw.rounded_rectangle((82, 82, W - 82, H - 82), radius=26, outline=(255, 255, 255, 170), width=2)

        banner = (245, 72, W - 245, 140)
        soft_shadow(img, banner, radius=22)
        draw.rounded_rectangle(banner, radius=20, fill=(255, 255, 255, 235), outline=gold, width=3)
        center_text(draw, "INVITATION OFFICIELLE", banner, medium_font, gold_dark)

        center_text_xy(draw, "MAMAN", W // 2, 185, medium_bold, "#FFF2C7")
        center_text_xy(
            draw,
            "KENNE",
            W // 2,
            270,
            title_font,
            "#FFE7A0",
            stroke="#3B2A0A",
            stroke_width=2,
        )
        center_text_xy(
            draw,
            "Hortance",
            W // 2,
            370,
            script_font,
            "#F5D77A",
            stroke="#3B2A0A",
            stroke_width=1,
        )

        badge_x = W - 245
        badge_y = 470

        draw.ellipse(
            (badge_x - 118, badge_y - 118, badge_x + 118, badge_y + 118),
            fill=(255, 248, 231, 235),
            outline=gold,
            width=6,
        )
        draw.ellipse(
            (badge_x - 96, badge_y - 96, badge_x + 96, badge_y + 96),
            outline=gold_light,
            width=3,
        )
        center_text_xy(draw, "50", badge_x, badge_y - 22, big_font, gold_dark)
        center_text_xy(draw, "ANS", badge_x, badge_y + 50, medium_bold, gold_dark)

        theme_box = (225, 635, W - 225, 705)
        draw.rounded_rectangle(theme_box, radius=22, fill=(255, 255, 255, 225), outline=gold, width=3)
        center_text(draw, "THÈME DE LA SOIRÉE : BLANC & OR", theme_box, small_bold, gold_dark)

        card = (95, 760, W - 95, 1600)
        soft_shadow(img, card, radius=34)
        draw.rounded_rectangle(card, radius=44, fill=(255, 255, 255, 242), outline=gold, width=5)
        draw.rounded_rectangle((120, 785, W - 120, 1575), radius=34, outline=gold_light, width=2)

        ticket_banner = (W // 2 - 310, 725, W // 2 + 310, 812)
        draw.rounded_rectangle(ticket_banner, radius=22, fill=gold, outline=gold_light, width=3)
        center_text(draw, "BILLET D’ENTRÉE", ticket_banner, medium_font, dark)

        name = fit_text(draw, guest.display_name.upper(), name_font, W - 230)
        center_text_xy(draw, name, W // 2, 890, name_font, dark)

        ticket_label = "BILLET COUPLE" if guest.ticket_type == "couple" else "BILLET SINGLE"
        people_label = "2 PERSONNES" if guest.ticket_type == "couple" else "1 PERSONNE"

        center_text_xy(draw, ticket_label, W // 2, 970, medium_bold, gold_dark)
        center_text_xy(draw, f"• {people_label} •", W // 2, 1015, small_bold, dark)

        qr_value = str(guest.qr_code or guest.id or guest.slug)
        qr_img = qrcode.make(qr_value).convert("RGB").resize((310, 310))

        qr_box = (W // 2 - 205, 1060, W // 2 + 205, 1470)
        draw.rounded_rectangle(qr_box, radius=34, fill=white, outline=gold_dark, width=6)
        draw.rounded_rectangle(
            (qr_box[0] + 18, qr_box[1] + 18, qr_box[2] - 18, qr_box[3] - 18),
            radius=24,
            outline=gold_light,
            width=3,
        )

        img.paste(qr_img, (W // 2 - 155, 1110))

        warning_box = (180, 1490, W - 180, 1548)
        draw.rounded_rectangle(warning_box, radius=18, fill=cream, outline=gold, width=2)
        center_text(
            draw,
            "QR CODE IMPÉRATIF À PRÉSENTER À L’ENTRÉE",
            warning_box,
            small_bold,
            gold_dark,
        )

        info_y = 1625
        info_card = (90, info_y - 58, W - 90, info_y + 55)

        draw.rounded_rectangle(info_card, radius=24, fill=(255, 255, 255, 235), outline=gold_light, width=2)
        draw.line((W // 3, info_y - 38, W // 3, info_y + 38), fill=gold, width=2)
        draw.line((2 * W // 3, info_y - 38, 2 * W // 3, info_y + 38), fill=gold, width=2)

        center_text_xy(draw, "DATE", W // 6, info_y - 18, tiny, gold_dark)
        center_text_xy(draw, "18 OCTOBRE 2026", W // 6, info_y + 18, small_bold, dark)
        center_text_xy(draw, "HEURE", W // 2, info_y - 18, tiny, gold_dark)
        center_text_xy(draw, "20H00", W // 2, info_y + 18, small_bold, dark)
        center_text_xy(draw, "LIEU", 5 * W // 6, info_y - 18, tiny, gold_dark)
        center_text_xy(draw, "BATCHAM", 5 * W // 6, info_y + 18, small_bold, dark)

        center_text_xy(
            draw,
            "Consignes : tenue blanc & or recommandée • billet personnel • contrôle QR à l’entrée",
            W // 2,
            1710,
            tiny,
            dark,
        )

        pdf_buffer = BytesIO()
        img.convert("RGB").save(pdf_buffer, format="PDF", resolution=150.0)
        pdf_buffer.seek(0)

        response = HttpResponse(pdf_buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="billet-{guest.slug}.pdf"'
        return response


def cover_image(image, target_w, target_h):
    image_w, image_h = image.size
    ratio = max(target_w / image_w, target_h / image_h)
    new_w = int(image_w * ratio)
    new_h = int(image_h * ratio)

    image = image.resize((new_w, new_h), Image.LANCZOS)

    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2

    return image.crop((left, top, left + target_w, top + target_h))


def font(name, size):
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts/georgiab.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]

    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)

    return ImageFont.load_default()


def center_text(draw, text, box, font_obj, fill):
    x1, y1, x2, y2 = box
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x1 + ((x2 - x1) - tw) / 2, y1 + ((y2 - y1) - th) / 2 - 2), text, font=font_obj, fill=fill)


def center_text_xy(draw, text, x, y, font_obj, fill, stroke=None, stroke_width=1):
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pos = (x - tw / 2, y - th / 2)

    if stroke:
        draw.text(pos, text, font=font_obj, fill=fill, stroke_width=stroke_width, stroke_fill=stroke)
    else:
        draw.text(pos, text, font=font_obj, fill=fill)


def fit_text(draw, text, font_obj, max_width):
    if draw.textbbox((0, 0), text, font=font_obj)[2] <= max_width:
        return text

    while len(text) > 3:
        text = text[:-1]
        candidate = text + "..."
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            return candidate

    return text


def soft_shadow(img, box, radius=20):
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (x1 + 8, y1 + 12, x2 + 8, y2 + 12),
        radius=radius,
        fill=(0, 0, 0, 75),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow)