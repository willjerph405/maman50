import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Download,
  CalendarDays,
  MapPin,
  Clock,
  MessageCircle,
  Copy,
  Crown,
  Palette,
  QrCode,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Ticket,
} from "lucide-react";
import QRCode from "react-qr-code";

import { api } from "../api/axios";
import BottomNavigation from "../components/layout/BottomNavigation";
import { EVENT } from "../config/event";

function GuestDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [guest, setGuest] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get(`/guests/${slug}/`)
      .then((res) => setGuest(res.data))
      .catch(() => setError("Impossible de charger ce billet."));
  }, [slug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E6] px-6">
        <div className="rounded-[34px] bg-white p-6 text-center shadow-xl">
          <h1 className="text-2xl font-black text-red-600">
            Billet introuvable
          </h1>

          <p className="mt-2 text-gray-500">{error}</p>

          <button
            onClick={() => navigate("/guests/manage")}
            className="mt-5 rounded-2xl bg-[#111827] px-5 py-3 font-black text-[#F5C542]"
          >
            Retour aux invités
          </button>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E6]">
        Chargement...
      </div>
    );
  }

  const isCouple = guest.ticket_type === "couple";
  const qrValue = String(guest.qr_code || guest.id || guest.slug);

  const ticketTypeLabel = isCouple ? "Billet Couple" : "Billet Single";

  const invitationMessage = `Bonjour,

Vous êtes cordialement invité(e) aux 50 ans de ${EVENT.celebrant}.

Voici votre billet d'invitation :
${guest.invitation_url}

Date : ${EVENT.date}
Heure : ${EVENT.time}
Lieu : ${EVENT.city}
Thème : ${EVENT.theme}

QR Code impératif à présenter à l’entrée.

Merci.`;

  const sendWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      invitationMessage
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(guest.invitation_url);
      alert("Lien copié !");
    } catch (error) {
      console.error(error);
      alert("Impossible de copier le lien.");
    }
  };

  const shareTicket = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: EVENT.title,
          text: invitationMessage,
          url: guest.invitation_url,
        });
      } else {
        await navigator.clipboard.writeText(invitationMessage);
        alert("Message copié !");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);

    try {
      const response = await api.get(`/guests/${guest.slug}/pdf/`, {
        responseType: "blob",
      });

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `billet-${guest.slug}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Erreur téléchargement PDF :", error);
      alert("Impossible de télécharger le billet PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm font-black text-[#B88900]"
        >
          <ArrowLeft size={19} />
          Retour
        </button>

        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-[#F5C542]">
              <Crown size={34} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Invitation premium
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Billet
              <br />
              personnalisé
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Billet PDF premium, lien WhatsApp et QR Code obligatoire à
              l’entrée.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Palette size={18} />
              <p className="text-sm font-black">Thème : {EVENT.theme}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 overflow-hidden rounded-[40px] border border-[#EEE1C6] bg-white shadow-xl">
          <div className="relative bg-[#111827] px-6 py-8 text-center text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.25),transparent_35%)]" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
                Invitation officielle
              </p>

              <h2 className="mt-4 text-4xl font-black">MAMAN KENNE</h2>

              <p className="mt-1 text-3xl font-black text-[#F5C542]">
                Hortance
              </p>

              <p className="mt-3 text-sm text-white/70">
                {EVENT.date} · {EVENT.time} · {EVENT.city}
              </p>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="mx-auto -mt-2 mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF6DE] text-[#B88900]">
              <Ticket size={30} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">
              Votre billet d’entrée
            </p>

            <h3 className="mt-4 text-3xl font-black">
              {guest.display_name}
            </h3>

            <div className="mt-4 flex justify-center">
              <span className="rounded-full border border-[#EEE1C6] bg-[#FFF6DE] px-5 py-2 text-sm font-black text-[#B88900]">
                {ticketTypeLabel} · {guest.places} place(s)
              </span>
            </div>

            <div className="my-7 flex justify-center">
              <div className="rounded-[32px] border-2 border-[#B88900] bg-white p-5 shadow-xl">
                <QRCode value={qrValue} size={210} />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#EEE1C6] bg-[#FFF6DE] p-4">
              <div className="flex items-center justify-center gap-2 text-[#B88900]">
                <QrCode size={20} />
                <p className="font-black">
                  QR Code impératif à présenter à l’entrée
                </p>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Ce billet est personnel et unique.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-left">
              <Info
                icon={<CalendarDays size={17} />}
                label="Date"
                value={EVENT.date}
              />

              <Info
                icon={<Clock size={17} />}
                label="Heure"
                value={EVENT.time}
              />

              <Info
                icon={<MapPin size={17} />}
                label="Lieu"
                value={EVENT.city}
              />
            </div>

            <div className="mt-5 rounded-[26px] bg-[#F7F1E6] p-4 text-left">
              <p className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500">
                <UserPlus size={13} />
                Créé par
              </p>

              <p className="font-black text-[#B88900]">
                {guest.created_by_username || "Non renseigné"}
              </p>
            </div>

            <div
              className={`mt-4 flex items-center gap-3 rounded-[26px] p-4 text-left ${
                guest.is_checked_in
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {guest.is_checked_in ? (
                <CheckCircle2 size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}

              <div>
                <p className="font-black">
                  {guest.is_checked_in ? "Entrée validée" : "En attente"}
                </p>
                <p className="text-sm opacity-80">
                  {guest.is_checked_in
                    ? "Ce billet a déjà été scanné."
                    : "Ce billet n’a pas encore été scanné."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[34px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-black text-[#B88900]">
            Lien de l’invitation
          </p>

          <div className="break-all rounded-2xl bg-[#FFF6DE] p-4 text-xs text-gray-700">
            {guest.invitation_url}
          </div>

          <button
            onClick={copyLink}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#EEE1C6] bg-white py-3 font-black text-[#B88900]"
          >
            <Copy size={18} />
            Copier le lien
          </button>
        </section>

        <section className="mt-6 space-y-3">
          <button
            onClick={sendWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-green-600 py-5 font-black text-white shadow-xl active:scale-[0.98]"
          >
            <MessageCircle size={20} />
            Envoyer par WhatsApp
          </button>

          <button
            onClick={shareTicket}
            className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#111827] py-5 font-black text-[#F5C542] shadow-xl active:scale-[0.98]"
          >
            <Share2 size={20} />
            Partager le lien
          </button>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-[28px] border border-[#EEE1C6] bg-white py-5 font-black text-[#B88900] shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <Download size={20} />
            {downloading ? "Téléchargement..." : "Télécharger PDF premium"}
          </button>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#FFF6DE] p-3">
      <div className="mb-2 text-[#B88900]">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

export default GuestDetails;