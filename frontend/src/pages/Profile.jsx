import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Crown,
  Users,
  Settings,
  LogOut,
  Mail,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Ticket,
  Armchair,
  QrCode,
  BarChart3,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

function Profile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setAdmin(res.data))
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });

    api
      .get("/guests/")
      .then((res) => setGuests(res.data))
      .catch(() => {});
  }, [navigate]);

  const myStats = useMemo(() => {
    if (!admin) {
      return {
        billets: 0,
        places: 0,
        placed: 0,
        entered: 0,
      };
    }

    const mine = guests.filter(
      (guest) => guest.created_by_username === admin.username
    );

    return {
      billets: mine.length,
      places: mine.reduce(
        (sum, guest) => sum + (guest.ticket_type === "couple" ? 2 : 1),
        0
      ),
      placed: mine.filter((guest) => guest.table_number).length,
      entered: mine.filter((guest) => guest.is_checked_in).length,
    };
  }, [admin, guests]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin_auth");

    navigate("/login");
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E6]">
        Chargement...
      </div>
    );
  }

  const isSuperAdmin = admin.role === "super_admin";

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-[#F5C542]">
              {isSuperAdmin ? <Crown size={48} /> : <User size={48} />}
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Espace admin
            </p>

            <h1 className="mt-3 text-4xl font-black">{admin.username}</h1>

            <p className="mt-2 text-white/70">
              {admin.email || "Aucune adresse email"}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F5C542] px-5 py-2 text-sm font-black text-[#111827]">
              {isSuperAdmin ? <Crown size={17} /> : <Shield size={17} />}
              {isSuperAdmin ? "SUPER ADMIN" : "ADMINISTRATEUR"}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-[#F5C542]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.celebrant} · {EVENT.theme}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <MiniStat
            icon={<Ticket size={22} />}
            label="Mes billets"
            value={myStats.billets}
          />

          <MiniStat
            icon={<Users size={22} />}
            label="Mes places"
            value={myStats.places}
          />

          <MiniStat
            icon={<Armchair size={22} />}
            label="Placés"
            value={myStats.placed}
          />

          <MiniStat
            icon={<QrCode size={22} />}
            label="Entrés"
            value={myStats.entered}
          />
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-black">Informations</h2>

          <InfoRow
            icon={<User size={20} />}
            label="Nom utilisateur"
            value={admin.username}
          />

          <InfoRow
            icon={<Mail size={20} />}
            label="Email"
            value={admin.email || "Non renseigné"}
          />

          <InfoRow
            icon={isSuperAdmin ? <Crown size={20} /> : <Shield size={20} />}
            label="Rôle"
            value={isSuperAdmin ? "Super Administrateur" : "Administrateur"}
          />

          <InfoRow
            icon={<CheckCircle2 size={20} />}
            label="Statut"
            value={admin.is_active === false ? "Compte inactif" : "Compte actif"}
          />

          <InfoRow
            icon={<Calendar size={20} />}
            label="Dernière connexion"
            value={
              admin.last_login
                ? new Date(admin.last_login).toLocaleString()
                : "Première connexion"
            }
          />
        </section>

        {isSuperAdmin && (
          <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-xl font-black">Administration</h2>

            <MenuButton
              icon={<Users size={22} />}
              title="Gestion des administrateurs"
              subtitle="Créer, supprimer et gérer les accès"
              onClick={() => navigate("/profile/admins")}
            />
          </section>
        )}

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-black">Application</h2>

          <MenuButton
            icon={<BarChart3 size={22} />}
            title="Statistiques avancées"
            subtitle="KPI, graphes et analyse globale"
            onClick={() => navigate("/profile/stats")}
          />

          <MenuButton
            icon={<Settings size={22} />}
            title="Paramètres"
            subtitle="Configuration de l’événement"
            onClick={() => navigate("/settings")}
          />
        </section>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[30px] bg-red-600 py-5 font-black text-white shadow-xl active:scale-[0.98]"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-[30px] border border-[#EEE1C6] bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-bold text-gray-500">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="mb-3 flex items-center gap-4 rounded-[26px] bg-[#FFFDF8] p-4 last:mb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase text-gray-400">{label}</p>

        <p className="truncate font-black">{value}</p>
      </div>
    </div>
  );
}

function MenuButton({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-3 flex w-full items-center justify-between rounded-[26px] bg-[#FFFDF8] p-4 text-left transition active:scale-[0.98] last:mb-0"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
          {icon}
        </div>

        <div>
          <p className="font-black">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <ChevronRight className="text-gray-400" size={20} />
    </button>
  );
}

export default Profile;