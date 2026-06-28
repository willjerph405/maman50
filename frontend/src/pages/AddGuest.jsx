import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Users,
  Phone,
  Mail,
  Crown,
  Sparkles,
  Ticket,
  CheckCircle2,
  Palette,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

function AddGuest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: "",
    ticket_type: "single",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const isCouple = form.ticket_type === "couple";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createGuest = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      display_name: form.display_name.trim(),
      ticket_type: form.ticket_type,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    };

    try {
      const response = await api.post("/guests/", payload);
      navigate(`/guests/${response.data.slug}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Impossible de créer le billet.");
    } finally {
      setLoading(false);
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
              Nouveau billet
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Créer une
              <br />
              invitation
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Génère un billet personnalisé avec QR Code premium pour les 50 ans
              de {EVENT.celebrant}.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Palette size={18} />
              <p className="text-sm font-black">Thème : {EVENT.theme}</p>
            </div>
          </div>
        </header>

        <form onSubmit={createGuest} className="mt-6 space-y-5">
          <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
                <Ticket size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black">Type de billet</h2>
                <p className="text-sm text-gray-500">
                  Single = 1 place, Couple = 2 places.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TicketOption
                active={!isCouple}
                icon={<User size={26} />}
                title="Single"
                subtitle="1 place"
                onClick={() => setForm({ ...form, ticket_type: "single" })}
              />

              <TicketOption
                active={isCouple}
                icon={<Users size={26} />}
                title="Couple"
                subtitle="2 places"
                onClick={() => setForm({ ...form, ticket_type: "couple" })}
              />
            </div>
          </section>

          <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black">Informations invité</h2>
              <p className="mt-1 text-sm text-gray-500">
                Le nom apparaîtra sur le billet PDF et dans le QR Code.
              </p>
            </div>

            <Field
              icon={<Sparkles size={20} />}
              label="Nom affiché sur le billet"
              name="display_name"
              placeholder={
                isCouple ? "M. et Mme TIAYOU JUNIOR" : "LONKENG DAVY"
              }
              value={form.display_name}
              onChange={handleChange}
              required
            />

            <Field
              icon={<Phone size={20} />}
              label="Téléphone"
              name="phone"
              placeholder="+237 6 XX XX XX XX"
              value={form.phone}
              onChange={handleChange}
            />

            <Field
              icon={<Mail size={20} />}
              label="Email"
              name="email"
              type="email"
              placeholder="Optionnel"
              value={form.email}
              onChange={handleChange}
            />
          </section>

          <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-[#B88900]">
              Aperçu rapide
            </p>

            <h3 className="mt-3 text-2xl font-black">
              {form.display_name ||
                (isCouple ? "M. et Mme ..." : "Nom de l’invité")}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {isCouple
                ? "Billet Couple · 2 places"
                : "Billet Single · 1 place"}
            </p>

            <div className="mt-4 rounded-[26px] bg-[#FFF6DE] p-4">
              <p className="text-sm font-black text-[#B88900]">
                Le billet généré contiendra :
              </p>

              <p className="mt-2 text-sm text-gray-600">
                QR Code obligatoire, thème {EVENT.theme}, lieu {EVENT.city},
                heure {EVENT.time}.
              </p>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading || !form.display_name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[30px] bg-[#111827] py-5 font-black text-[#F5C542] shadow-2xl active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle2 size={21} />
            {loading ? "Création du billet..." : "Créer et générer le billet"}
          </button>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
}

function TicketOption({ active, icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[28px] border p-5 text-left transition active:scale-[0.98] ${
        active
          ? "border-[#B88900] bg-[#111827] text-white shadow-xl"
          : "border-[#EEE1C6] bg-[#FFFDF8] text-[#171717]"
      }`}
    >
      <div className={active ? "text-[#F5C542]" : "text-[#B88900]"}>
        {icon}
      </div>

      <p className="mt-4 text-lg font-black">{title}</p>
      <p className={active ? "text-sm text-white/70" : "text-sm text-gray-500"}>
        {subtitle}
      </p>
    </button>
  );
}

function Field({ icon, label, ...props }) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="mb-2 block text-sm font-black">{label}</label>

      <div className="flex items-center gap-3 rounded-[26px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4 focus-within:border-[#B88900]">
        <span className="text-[#B88900]">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

export default AddGuest;