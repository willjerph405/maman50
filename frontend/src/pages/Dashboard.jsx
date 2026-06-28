import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Users,
  Ticket,
  QrCode,
  Armchair,
  CheckCircle2,
  Plus,
  Sparkles,
  Palette,
  MapPin,
  Clock,
  CalendarDays,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

function Dashboard() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    api.get("/guests/").then((res) => setGuests(res.data));
  }, []);

  const stats = useMemo(() => {
    const couples = guests.filter((g) => g.ticket_type === "couple").length;
    const singles = guests.filter((g) => g.ticket_type === "single").length;
    const places = guests.reduce(
      (sum, g) => sum + (g.ticket_type === "couple" ? 2 : 1),
      0
    );
    const checked = guests.filter((g) => g.is_checked_in).length;
    const placed = guests.filter((g) => g.table_number).length;

    return { couples, singles, places, checked, placed };
  }, [guests]);

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
                  Dashboard Premium
                </p>

                <h1 className="mt-4 text-4xl font-black leading-tight">
                  {EVENT.celebrant}
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  Gestion haut de gamme des invités, billets, tables et accès.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-[#F5C542]">
                <Crown size={30} />
              </div>
            </div>

            <div className="mt-6 rounded-[30px] bg-white/10 p-4 backdrop-blur">
              <div className="grid grid-cols-3 gap-3">
                <EventInfo icon={<CalendarDays size={17} />} label="Date" value={EVENT.date} />
                <EventInfo icon={<Clock size={17} />} label="Heure" value={EVENT.time} />
                <EventInfo icon={<MapPin size={17} />} label="Lieu" value={EVENT.city} />
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
                <Palette size={18} />
                <p className="text-sm font-black">Thème : {EVENT.theme}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-4">
          <BigStat
            icon={<Users size={24} />}
            label="Invités"
            value={guests.length}
            subtitle="Billets créés"
          />

          <BigStat
            icon={<Ticket size={24} />}
            label="Places"
            value={stats.places}
            subtitle="Single + Couple"
          />

          <BigStat
            icon={<CheckCircle2 size={24} />}
            label="Entrées"
            value={stats.checked}
            subtitle="QR validés"
          />

          <BigStat
            icon={<Armchair size={24} />}
            label="Placés"
            value={stats.placed}
            subtitle="Avec table"
          />
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Actions rapides</h2>
              <p className="text-sm text-gray-500">
                Les raccourcis essentiels de l’événement.
              </p>
            </div>

            <Sparkles className="text-[#B88900]" size={24} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              icon={<Plus size={22} />}
              title="Ajouter"
              subtitle="Nouvel invité"
              onClick={() => navigate("/guests/new")}
            />

            <ActionButton
              icon={<QrCode size={22} />}
              title="Scanner"
              subtitle="Contrôle entrée"
              onClick={() => navigate("/scanner")}
            />

            <ActionButton
              icon={<Users size={22} />}
              title="Invités"
              subtitle="Gestion avancée"
              onClick={() => navigate("/guests/manage")}
            />

            <ActionButton
              icon={<Armchair size={22} />}
              title="Tables"
              subtitle="Placement"
              onClick={() => navigate("/tables")}
            />
          </div>
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Répartition</h2>

          <div className="mt-4 space-y-3">
            <Progress label="Couples" value={stats.couples} total={guests.length || 1} />
            <Progress label="Singles" value={stats.singles} total={guests.length || 1} />
            <Progress label="Places attribuées" value={stats.placed} total={guests.length || 1} />
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function EventInfo({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="mb-2 text-[#F5C542]">{icon}</div>
      <p className="text-[10px] uppercase text-white/50">{label}</p>
      <p className="text-xs font-black">{value}</p>
    </div>
  );
}

function BigStat({ icon, label, value, subtitle }) {
  return (
    <div className="rounded-[34px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 font-black">{label}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function ActionButton({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[28px] border border-[#EEE1C6] bg-[#FFFDF8] p-4 text-left transition active:scale-[0.98]"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <p className="font-black">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </button>
  );
}

function Progress({ label, value, total }) {
  const percent = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="text-[#B88900]">{value}</span>
      </div>

      <div className="h-3 rounded-full bg-[#F7F1E6]">
        <div
          className="h-3 rounded-full bg-[#B88900]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default Dashboard;