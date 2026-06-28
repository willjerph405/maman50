import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  UserPlus,
  Shield,
  Users,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get("/auth/admins/");
      setAdmins(response.data);
    } catch (error) {
      console.error(error);
      alert("Accès réservé au Super Admin.");
    }
  };

  const stats = useMemo(() => {
    return {
      total: admins.length,
      superAdmins: admins.filter((a) => a.is_superuser).length,
      admins: admins.filter((a) => !a.is_superuser).length,
      active: admins.filter((a) => a.is_active).length,
    };
  }, [admins]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/admins/", form);

      setForm({
        username: "",
        email: "",
        password: "",
        role: "admin",
      });

      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Impossible de créer l’admin.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteSelectedAdmins = async () => {
    if (selectedIds.length === 0) return;

    const ok = confirm(
      `Supprimer ${selectedIds.length} administrateur(s) sélectionné(s) ?`
    );

    if (!ok) return;

    try {
      await api.delete("/auth/admins/", {
        data: { ids: selectedIds },
      });

      setSelectedIds([]);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Suppression impossible.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-[#F5C542]">
              <Crown size={34} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Super Admin
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Gestion
              <br />
              des admins
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Ajoute, consulte et supprime les administrateurs autorisés à gérer
              l’événement.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.celebrant} · {EVENT.theme}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <HeaderStat label="Total" value={stats.total} icon={<Users size={18} />} />
              <HeaderStat label="Actifs" value={stats.active} icon={<CheckCircle2 size={18} />} />
              <HeaderStat label="Super Admin" value={stats.superAdmins} icon={<Crown size={18} />} />
              <HeaderStat label="Admins" value={stats.admins} icon={<Shield size={18} />} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
              <UserPlus size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Ajouter un admin</h2>
              <p className="text-sm text-gray-500">
                Crée un accès temporaire ou permanent.
              </p>
            </div>
          </div>

          <form onSubmit={createAdmin} className="space-y-4">
            <Field
              icon={<Shield size={20} />}
              label="Nom utilisateur"
              name="username"
              placeholder="ex : accueil01"
              value={form.username}
              onChange={handleChange}
              required
            />

            <Field
              icon={<Mail size={20} />}
              label="Email"
              name="email"
              type="email"
              placeholder="admin@email.com"
              value={form.email}
              onChange={handleChange}
            />

            <Field
              icon={<Lock size={20} />}
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="Mot de passe provisoire"
              value={form.password}
              onChange={handleChange}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-black">Rôle</label>

              <div className="grid grid-cols-2 gap-3">
                <RoleButton
                  active={form.role === "admin"}
                  title="Admin"
                  subtitle="Gestion événement"
                  onClick={() => setForm({ ...form, role: "admin" })}
                />

                <RoleButton
                  active={form.role === "super_admin"}
                  title="Super Admin"
                  subtitle="Accès complet"
                  onClick={() => setForm({ ...form, role: "super_admin" })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#111827] py-5 font-black text-[#F5C542] shadow-xl disabled:opacity-50"
            >
              <UserPlus size={20} />
              {loading ? "Création..." : "Créer l’administrateur"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Administrateurs</h2>
              <p className="text-sm text-gray-500">
                Sélection multiple possible.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#B88900]">
              {selectedIds.length} sélectionné(s)
            </span>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelectedAdmins}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-red-600 py-4 font-black text-white shadow-xl active:scale-[0.98]"
            >
              <Trash2 size={20} />
              Supprimer {selectedIds.length} admin(s)
            </button>
          )}

          <div className="space-y-3">
            {admins.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                selected={selectedIds.includes(admin.id)}
                onToggle={() => toggleSelect(admin.id)}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function HeaderStat({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#B88900]">
        {icon}
      </div>

      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function Field({ icon, label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black">{label}</label>

      <div className="flex items-center gap-3 rounded-[26px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4 focus-within:border-[#B88900]">
        <span className="text-[#B88900]">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

function RoleButton({ active, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[26px] border p-4 text-left active:scale-[0.98] ${
        active
          ? "border-[#B88900] bg-[#111827] text-white shadow-xl"
          : "border-[#EEE1C6] bg-[#FFFDF8]"
      }`}
    >
      <p className="font-black">{title}</p>
      <p className={active ? "text-sm text-white/60" : "text-sm text-gray-500"}>
        {subtitle}
      </p>
    </button>
  );
}

function AdminCard({ admin, selected, onToggle }) {
  return (
    <div
      className={`rounded-[32px] border p-4 shadow-sm ${
        selected
          ? "border-red-300 bg-red-50"
          : "border-[#EEE1C6] bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-5 w-5 accent-red-600"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
          {admin.is_superuser ? <Crown size={26} /> : <Shield size={26} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-black">{admin.username}</p>

          <p className="truncate text-sm text-gray-500">
            {admin.email || "Email non renseigné"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#FFF6DE] px-3 py-1 text-xs font-black text-[#B88900]">
              {admin.is_superuser ? "Super Admin" : "Admin"}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                admin.is_active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {admin.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {admin.is_active ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admins;