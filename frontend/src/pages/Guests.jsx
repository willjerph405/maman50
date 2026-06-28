import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Ticket,
  UserRound,
  UserRoundCheck,
  Filter,
  UserPlus,
} from "lucide-react";

import { api } from "../api/axios";
import BottomNavigation from "../components/layout/BottomNavigation";

function Guests() {
  const navigate = useNavigate();

  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests/");
      setGuests(response.data);
    } catch (error) {
      console.error("Erreur chargement invités :", error);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch = `${guest.display_name} ${guest.phone || ""} ${
        guest.email || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        guest.ticket_type === filter ||
        (filter === "checked" && guest.is_checked_in);

      return matchesSearch && matchesFilter;
    });
  }, [guests, search, filter]);

  const couples = guests.filter((g) => g.ticket_type === "couple").length;
  const singles = guests.filter((g) => g.ticket_type === "single").length;
  const checked = guests.filter((g) => g.is_checked_in).length;

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-28 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="rounded-[36px] bg-[#111827] p-6 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/70">Administration</p>
              <h1 className="mt-2 text-4xl font-black">Invités</h1>
              <p className="mt-2 text-white/70">
                Gérez les billets Single et Couple.
              </p>
            </div>

            <button
              onClick={() => navigate("/guests/new")}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5C542] text-[#111827] shadow-lg active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat label="Total" value={guests.length} icon={<Users size={18} />} />
            <MiniStat label="Couples" value={couples} icon={<Ticket size={18} />} />
            <MiniStat label="Singles" value={singles} icon={<UserRound size={18} />} />
          </div>
        </header>

        <section className="mt-6">
          <div className="flex items-center gap-3 rounded-[24px] border border-[#EEE1C6] bg-white px-4 py-4 shadow-sm">
            <Search size={20} className="text-[#B88900]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom, téléphone ou email..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              Tous {guests.length}
            </FilterButton>

            <FilterButton active={filter === "couple"} onClick={() => setFilter("couple")}>
              Couples {couples}
            </FilterButton>

            <FilterButton active={filter === "single"} onClick={() => setFilter("single")}>
              Singles {singles}
            </FilterButton>

            <FilterButton active={filter === "checked"} onClick={() => setFilter("checked")}>
              Entrés {checked}
            </FilterButton>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Liste des invités</h2>

            <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#B88900]">
              <Filter size={14} />
              {filteredGuests.length}
            </div>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-[#D6C49B] bg-white/70 p-8 text-center">
              <Users className="mx-auto text-[#B88900]" size={42} />
              <p className="mt-4 font-black">Aucun invité trouvé</p>
              <p className="mt-1 text-sm text-gray-500">
                Essaie un autre nom ou ajoute un nouvel invité.
              </p>

              <button
                onClick={() => navigate("/guests/new")}
                className="mt-5 rounded-2xl bg-[#111827] px-5 py-3 font-bold text-[#F5C542]"
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
                  onClick={() => navigate(`/guests/${guest.slug}`)}
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

function MiniStat({ label, value, icon }) {
  return (
    <div className="rounded-3xl bg-white/10 p-3 backdrop-blur">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#B88900]">
        {icon}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
        active
          ? "bg-[#111827] text-[#F5C542]"
          : "border border-[#EEE1C6] bg-white text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

function GuestRow({ guest, onClick }) {
  const initials = guest.display_name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[30px] border border-[#EEE1C6] bg-white p-4 text-left shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DE] text-lg font-black text-[#B88900]">
          {initials || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-black">{guest.display_name}</p>

          <p className="mt-1 text-sm text-gray-500">
            {guest.ticket_type === "couple" ? "Billet Couple" : "Billet Single"} ·{" "}
            {guest.places} place(s)
          </p>

          <p className="mt-1 truncate text-xs text-gray-400">
            {guest.phone || "Téléphone non renseigné"}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#B88900]">
            <UserPlus size={13} />
            Créé par : {guest.created_by_username || "Non renseigné"}
          </p>
        </div>

        <div className="text-right">
          {guest.is_checked_in ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <UserRoundCheck size={13} />
              Entré
            </span>
          ) : (
            <span className="rounded-full bg-[#FFF6DE] px-3 py-1 text-xs font-black text-[#B88900]">
              Attente
            </span>
          )}

          <p className="mt-2 text-xs font-bold text-gray-400">
            {guest.table_number ? `Table ${guest.table_number}` : "Sans table"}
          </p>
        </div>
      </div>
    </button>
  );
}

export default Guests;