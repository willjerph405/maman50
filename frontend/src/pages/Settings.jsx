import {
  Settings as SettingsIcon,
  CalendarDays,
  MapPin,
  Clock,
  User,
  Shield,
  Palette,
  Database,
  Download,
  Bell,
  ChevronRight,
  Crown,
  Sparkles,
  QrCode,
  Ticket,
} from "lucide-react";

import BottomNavigation from "../components/layout/BottomNavigation";
import { EVENT } from "../config/event";

function Settings() {
  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-[#F5C542]">
              <SettingsIcon size={34} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Configuration
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Paramètres
              <br />
              événement
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Centre de configuration de l’événement, du thème et des règles
              d’accès.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.celebrant} · {EVENT.theme}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
              <Crown size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Événement</h2>
              <p className="text-sm text-gray-500">
                Informations principales utilisées sur les billets.
              </p>
            </div>
          </div>

          <InfoRow icon={<User size={20} />} label="Célébrée" value={EVENT.celebrant} />
          <InfoRow icon={<CalendarDays size={20} />} label="Date" value={EVENT.date} />
          <InfoRow icon={<Clock size={20} />} label="Heure" value={EVENT.time} />
          <InfoRow icon={<MapPin size={20} />} label="Lieu" value={EVENT.city} />
          <InfoRow icon={<Palette size={20} />} label="Thème" value={EVENT.theme} />
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
              <Ticket size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Billets</h2>
              <p className="text-sm text-gray-500">
                Règles visibles sur les billets PDF.
              </p>
            </div>
          </div>

          <PremiumRule
            icon={<QrCode size={20} />}
            title="QR Code obligatoire"
            subtitle={EVENT.qrInstruction}
          />

          <PremiumRule
            icon={<Palette size={20} />}
            title="Dress code"
            subtitle={EVENT.dressCode}
          />

          <PremiumRule
            icon={<Shield size={20} />}
            title="Sécurité"
            subtitle={EVENT.note}
          />
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Application</h2>

          <MenuItem
            icon={<Palette size={20} />}
            title="Identité visuelle"
            subtitle="Blanc ivoire, or champagne, noir premium"
          />

          <MenuItem
            icon={<Shield size={20} />}
            title="Protection admin"
            subtitle="Connexion JWT sécurisée"
          />

          <MenuItem
            icon={<Bell size={20} />}
            title="Notifications"
            subtitle="Module à venir"
          />

          <MenuItem
            icon={<Database size={20} />}
            title="Sauvegarde"
            subtitle="Export et backup à venir"
          />
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Exports</h2>

          <button className="flex w-full items-center gap-4 rounded-[28px] bg-[#111827] p-5 text-left text-[#F5C542] shadow-xl active:scale-[0.98]">
            <Download size={24} />

            <div>
              <p className="font-black">Exporter les données</p>
              <p className="text-sm text-white/60">
                Excel / PDF / statistiques à venir
              </p>
            </div>
          </button>
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Version</h2>

          <div className="rounded-[28px] bg-[#FFF6DE] p-5">
            <p className="text-sm font-black text-[#B88900]">
              Application événementielle premium
            </p>

            <p className="mt-1 text-3xl font-black">MVP 1.0</p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Gestion invités, billets QR premium, scan, tables, admins,
              affinités et contrôle d’accès mobile.
            </p>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="mb-3 flex items-center gap-4 rounded-[26px] bg-[#FFFDF8] p-4 last:mb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
        <p className="font-black">{value}</p>
      </div>
    </div>
  );
}

function PremiumRule({ icon, title, subtitle }) {
  return (
    <div className="mb-3 rounded-[26px] bg-[#FFFDF8] p-4 last:mb-0">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
          {icon}
        </div>

        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-sm leading-5 text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, title, subtitle }) {
  return (
    <button className="mb-3 flex w-full items-center justify-between rounded-[26px] bg-[#FFFDF8] p-4 text-left transition active:scale-[0.98] last:mb-0">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
          {icon}
        </div>

        <div>
          <p className="font-black">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <ChevronRight size={19} className="text-gray-400" />
    </button>
  );
}

export default Settings;