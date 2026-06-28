import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  User,
  Heart,
  Armchair,
  CheckCircle2,
  Ticket,
  Phone,
  Mail,
  UserPlus,
  Filter,
  Sparkles,
} from "lucide-react";

import { api } from "../api/axios";
import BottomNavigation from "../components/layout/BottomNavigation";
import { EVENT } from "../config/event";

function GuestsManage() {
  const navigate = useNavigate();

  const [guests, setGuests] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests/");
      setGuests(response.data);
    } catch (error) {
      console.error("Erreur chargement invités :", error);
    }
  };

  const getPlaces = (guest) => {
    return guest.ticket_type === "couple" ? 2 : 1;
  };

  const creators = useMemo(() => {
    const names = guests.map(
      (guest) => guest.created_by_username || "Non renseigné"
    );

    return ["all", ...Array.from(new Set(names)).sort()];
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const creator = guest.created_by_username || "Non renseigné";

      const matchesCreator =
        creatorFilter === "all" || creator === creatorFilter;

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "couple" && guest.ticket_type === "couple") ||
        (typeFilter === "single" && guest.ticket_type === "single") ||
        (typeFilter === "no_table" && !guest.table_number) ||
        (typeFilter === "checked" && guest.is_checked_in);

      const searchableText = `${guest.display_name} ${guest.phone || ""} ${
        guest.email || ""
      } ${creator}`.toLowerCase();

      return (
        matchesCreator &&
        matchesType &&
        searchableText.includes(query.toLowerCase())
      );
    });
  }, [guests, query, typeFilter, creatorFilter]);

  const stats = useMemo(() => {
    const couples = filteredGuests.filter((g) => g.ticket_type === "couple");
    const singles = filteredGuests.filter((g) => g.ticket_type === "single");
    const placed = filteredGuests.filter((g) => g.table_number);
    const checked = filteredGuests.filter((g) => g.is_checked_in);

    return {
      billets: filteredGuests.length,
      places: filteredGuests.reduce((sum, guest) => sum + getPlaces(guest), 0),
      couples: couples.length,
      singles: singles.length,
      placed: placed.length,
      checked: checked.length,
    };
  }, [filteredGuests]);

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Invités premium
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black leading-tight">
                  Gestion
                  <br />
                  invités
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  Liste claire avec filtre par affinité, type de billet, table
                  et présence.
                </p>
              </div>

              <button
                onClick={() => navigate("/guests/new")}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[#F5C542] text-[#111827] shadow-xl active:scale-95"
              >
                <Plus size={27} />
              </button>
            </div>

            <div className="mt-5 rounded-[30px] bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-[#F5C542]">
                <Sparkles size={18} />
                <p className="text-sm font-black">
                  {EVENT.celebrant} · Thème {EVENT.theme}
                </p>
              </div>

              <p className="mt-2 text-xs text-white/60">
                Affichage actuel : {stats.billets} billet(s) · {stats.places}{" "}
                place(s)
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <HeaderStat
                icon={<Ticket size={18} />}
                label="Billets"
                value={stats.billets}
              />

              <HeaderStat
                icon={<Users size={18} />}
                label="Places"
                value={stats.places}
              />

              <HeaderStat
                icon={<Heart size={18} />}
                label="Couples"
                value={stats.couples}
              />

              <HeaderStat
                icon={<User size={18} />}
                label="Singles"
                value={stats.singles}
              />
            </div>
          </div>
        </header>

        <section className="sticky top-0 z-20 -mx-5 mt-5 bg-[#F7F1E6]/95 px-5 py-3 backdrop-blur">
          <div className="rounded-[34px] border border-[#EEE1C6] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 rounded-[26px] bg-[#FFFDF8] px-4 py-4">
              <Search size={20} className="text-[#B88900]" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher nom, téléphone, créateur..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">
                Affinité / Créé par
              </label>

              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-full rounded-[22px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4 text-sm font-black outline-none focus:border-[#B88900]"
              >
                {creators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator === "all" ? "Voir tous les créateurs" : creator}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <FilterChip
                active={typeFilter === "all"}
                onClick={() => setTypeFilter("all")}
              >
                Tous
              </FilterChip>

              <FilterChip
                active={typeFilter === "couple"}
                onClick={() => setTypeFilter("couple")}
              >
                Couples
              </FilterChip>

              <FilterChip
                active={typeFilter === "single"}
                onClick={() => setTypeFilter("single")}
              >
                Singles
              </FilterChip>

              <FilterChip
                active={typeFilter === "no_table"}
                onClick={() => setTypeFilter("no_table")}
              >
                Sans table
              </FilterChip>

              <FilterChip
                active={typeFilter === "checked"}
                onClick={() => setTypeFilter("checked")}
              >
                Entrés
              </FilterChip>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-3">
          <SmallStat
            label="Placés"
            value={stats.placed}
            icon={<Armchair size={17} />}
          />

          <SmallStat
            label="Entrés"
            value={stats.checked}
            icon={<CheckCircle2 size={17} />}
          />

          <SmallStat
            label="Résultats"
            value={filteredGuests.length}
            icon={<Filter size={17} />}
          />
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Invités affichés</h2>
              <p className="text-sm text-gray-500">
                {creatorFilter === "all"
                  ? "Tous les créateurs"
                  : `Créés par ${creatorFilter}`}
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#B88900]">
              {filteredGuests.length}
            </span>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="rounded-[34px] border border-dashed border-[#D6C49B] bg-white/70 p-8 text-center">
              <Users className="mx-auto text-[#B88900]" size={42} />

              <p className="mt-4 font-black">Aucun invité trouvé</p>

              <p className="mt-1 text-sm text-gray-500">
                Modifie le filtre ou ajoute un nouvel invité.
              </p>

              <button
                onClick={() => navigate("/guests/new")}
                className="mt-5 rounded-2xl bg-[#111827] px-5 py-3 font-black text-[#F5C542]"
              >
                Ajouter un invité
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onOpen={() => navigate(`/guests/${guest.slug}`)}
                  onTable={() => navigate("/tables")}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function HeaderStat({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#B88900]">
        {icon}
      </div>

      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <div className="rounded-[26px] border border-[#EEE1C6] bg-white p-4 text-center shadow-sm">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <p className="text-xl font-black">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition active:scale-95 ${
        active
          ? "bg-[#111827] text-[#F5C542]"
          : "border border-[#EEE1C6] bg-white text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

function GuestRow({ guest, onOpen, onTable }) {
  const isCouple = guest.ticket_type === "couple";
  const places = isCouple ? 2 : 1;

  const initials = guest.display_name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-[32px] border border-[#EEE1C6] bg-white p-4 shadow-sm">
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[24px] text-lg font-black ${
              isCouple
                ? "bg-rose-50 text-rose-700"
                : "bg-[#FFF6DE] text-[#B88900]"
            }`}
          >
            {isCouple ? "2" : initials || "1"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black">
              {guest.display_name}
            </p>

            <p className="mt-1 text-xs font-bold text-gray-500">
              {isCouple ? "Billet Couple" : "Billet Single"} · {places} place
              {places > 1 ? "s" : ""}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#B88900]">
              <UserPlus size={13} />
              Créé par : {guest.created_by_username || "Non renseigné"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {guest.phone && (
                <MiniInfo icon={<Phone size={12} />} value={guest.phone} />
              )}

              {guest.email && (
                <MiniInfo icon={<Mail size={12} />} value={guest.email} />
              )}
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-black ${
                guest.is_checked_in
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {guest.is_checked_in ? "Entré" : "Attente"}
            </span>

            <p className="mt-2 text-xs font-black text-[#B88900]">
              {guest.table_number ? `Table ${guest.table_number}` : "Sans table"}
            </p>
          </div>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-[#F2E8D0] pt-3">
        <button onClick={onOpen} className="text-sm font-black text-[#111827]">
          Voir billet
        </button>

        <button
          onClick={onTable}
          className="flex items-center gap-1 text-sm font-black text-[#B88900]"
        >
          <Armchair size={15} />
          Table
        </button>
      </div>
    </div>
  );
}

function MiniInfo({ icon, value }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#F7F1E6] px-2 py-1 text-[10px] font-bold text-gray-500">
      {icon}
      <span className="truncate">{value}</span>
    </span>
  );
}

export default GuestsManage;