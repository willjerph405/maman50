import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Crown,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        username: form.username.trim(),
        password: form.password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("admin_auth", "true");

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E6] px-5 py-8 text-[#171717]">
      <main className="mx-auto flex min-h-[90vh] max-w-md flex-col justify-center">
        <header className="relative overflow-hidden rounded-[44px] bg-[#111827] p-8 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[32px] bg-white/10 text-[#F5C542]">
              <Crown size={42} />
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Admin Access
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              MAMAN KENNE
              <br />
              <span className="text-[#F5C542]">Hortance</span>
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/70">
              Espace sécurisé pour gérer les invitations, billets QR, tables et
              contrôle d’accès.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.city} · {EVENT.time} · {EVENT.theme}
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={login}
          className="mt-6 rounded-[38px] border border-[#EEE1C6] bg-white p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-black">Connexion admin</h2>
              <p className="text-sm text-gray-500">
                Accès réservé aux administrateurs.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">
              Nom utilisateur
            </label>

            <div className="flex items-center gap-3 rounded-[26px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4 focus-within:border-[#B88900]">
              <User size={20} className="text-[#B88900]" />

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="ex : will"
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-black">
              Mot de passe
            </label>

            <div className="flex items-center gap-3 rounded-[26px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4 focus-within:border-[#B88900]">
              <Lock size={20} className="text-[#B88900]" />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[30px] bg-[#111827] py-5 font-black text-[#F5C542] shadow-2xl active:scale-[0.98] disabled:opacity-60"
          >
            <ShieldCheck size={20} />
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-gray-400">
          Application événementielle premium · Billets QR sécurisés
        </p>
      </main>
    </div>
  );
}

export default Login;