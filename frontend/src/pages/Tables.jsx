import { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  Search,
  Users,
  Crown,
  Sparkles,
  UserPlus,
  X,
  Trash2,
  Filter,
  CheckCircle2,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

const TOTAL_TABLES = 50;
const MAX_PLACES_PER_TABLE = 8;

function Tables() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [saving, setSaving] = useState(false);

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
    const grouped = {};

    guests.forEach((guest) => {
      const creator = guest.created_by_username || "Non renseigné";

      if (!grouped[creator]) {
        grouped[creator] = {
          name: creator,
          billets: 0,
          places: 0,
        };
      }

      grouped[creator].billets += 1;
      grouped[creator].places += getPlaces(guest);
    });

    return Object.values(grouped).sort((a, b) => b.places - a.places);
  }, [guests]);

  const tables = useMemo(() => {
    const result = [];

    for (let i = 1; i <= TOTAL_TABLES; i += 1) {
      const members = guests.filter(
        (guest) => Number(guest.table_number) === i
      );

      const usedPlaces = members.reduce(
        (sum, guest) => sum + getPlaces(guest),
        0
      );

      result.push({
        number: i,
        members,
        usedPlaces,
        freePlaces: MAX_PLACES_PER_TABLE - usedPlaces,
        isFull: usedPlaces >= MAX_PLACES_PER_TABLE,
      });
    }

    return result;
  }, [guests]);

  const unassignedGuests = useMemo(() => {
    return guests.filter((guest) => {
      const creator = guest.created_by_username || "Non renseigné";

      const matchesCreator =
        selectedCreators.length === 0 || selectedCreators.includes(creator);

      const matchesSearch = `${guest.display_name} ${guest.phone || ""} ${
        guest.email || ""
      } ${creator}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return !guest.table_number && matchesCreator && matchesSearch;
    });
  }, [guests, selectedCreators, search]);

  const stats = useMemo(() => {
    const totalPlaces = guests.reduce(
      (sum, guest) => sum + getPlaces(guest),
      0
    );

    const placedPlaces = guests
      .filter((guest) => guest.table_number)
      .reduce((sum, guest) => sum + getPlaces(guest), 0);

    return {
      totalGuests: guests.length,
      totalPlaces,
      placedPlaces,
      remainingPlaces: totalPlaces - placedPlaces,
      tablesUsed: tables.filter((table) => table.usedPlaces > 0).length,
      fullTables: tables.filter((table) => table.isFull).length,
    };
  }, [guests, tables]);

  const toggleCreator = (name) => {
    setSelectedCreators((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const resetCreators = () => {
    setSelectedCreators([]);
  };

  const assignGuestToTable = async (guest, tableNumber) => {
    const table = tables.find((item) => item.number === tableNumber);
    const guestPlaces = getPlaces(guest);

    if (!table) return;

    if (table.usedPlaces + guestPlaces > MAX_PLACES_PER_TABLE) {
      alert(
        `Table ${tableNumber} pleine ou insuffisante. Il reste ${table.freePlaces} place(s).`
      );
      return;
    }

    setSaving(true);

    try {
      await api.post(`/guests/${guest.slug}/assign_table/`, {
        table_number: tableNumber,
      });

      await fetchGuests();
      setDraggedGuest(null);
      setSelectedTable(tableNumber);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Impossible d’attribuer la table.");
    } finally {
      setSaving(false);
    }
  };

  const removeGuestFromTable = async (guest) => {
    setSaving(true);

    try {
      await api.post(`/guests/${guest.slug}/assign_table/`, {
        table_number: "",
      });

      await fetchGuests();
    } catch (error) {
      console.error(error);
      alert("Impossible de retirer l’invité de la table.");
    } finally {
      setSaving(false);
    }
  };

  const selectedTableData = tables.find(
    (table) => table.number === selectedTable
  );
   return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-6xl px-4 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Plan de salle premium
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Tables & Placement
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Glisse un invité vers une table. Chaque table accepte maximum{" "}
              {MAX_PLACES_PER_TABLE} places. Couple = 2 places, Single = 1 place.
            </p>

            <div className="mt-5 flex max-w-xl items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.celebrant} · Thème {EVENT.theme}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
              <HeaderStat label="Invités" value={stats.totalGuests} />
              <HeaderStat label="Places" value={stats.totalPlaces} />
              <HeaderStat label="Placées" value={stats.placedPlaces} />
              <HeaderStat label="Restantes" value={stats.remainingPlaces} />
              <HeaderStat label="Tables utilisées" value={stats.tablesUsed} />
              <HeaderStat label="Tables pleines" value={stats.fullTables} />
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Affinités</h2>
                  <p className="text-sm text-gray-500">
                    Coche les créateurs pour placer leurs invités ensemble.
                  </p>
                </div>

                <Crown className="text-[#B88900]" size={24} />
              </div>

              <button
                onClick={resetCreators}
                className={`mb-3 w-full rounded-[24px] px-4 py-3 text-sm font-black ${
                  selectedCreators.length === 0
                    ? "bg-[#111827] text-[#F5C542]"
                    : "border border-[#EEE1C6] bg-[#FFFDF8] text-gray-600"
                }`}
              >
                Voir toutes les affinités
              </button>

              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {creators.map((creator) => (
                  <CreatorCheck
                    key={creator.name}
                    creator={creator}
                    checked={selectedCreators.includes(creator.name)}
                    onChange={() => toggleCreator(creator.name)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Invités à placer</h2>
                  <p className="text-sm text-gray-500">
                    Glisse une carte vers une table.
                  </p>
                </div>

                <Filter className="text-[#B88900]" size={24} />
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4">
                <Search size={20} className="text-[#B88900]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un invité..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <div className="mb-3 rounded-2xl bg-[#FFF6DE] p-3 text-sm font-black text-[#B88900]">
                {unassignedGuests.length} invité(s) non placé(s)
              </div>

              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {unassignedGuests.map((guest) => (
                  <GuestDraggableCard
                    key={guest.id}
                    guest={guest}
                    onDragStart={() => setDraggedGuest(guest)}
                    onDragEnd={() => setDraggedGuest(null)}
                  />
                ))}

                {unassignedGuests.length === 0 && (
                  <div className="rounded-[28px] border border-dashed border-[#D6C49B] bg-[#FFFDF8] p-6 text-center">
                    <Users className="mx-auto text-[#B88900]" size={36} />
                    <p className="mt-3 font-black">Aucun invité à placer</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Change l’affinité ou la recherche.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </aside>

          <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Vue des 50 tables</h2>
                <p className="text-sm text-gray-500">
                  Clique sur une table pour voir les personnes. Dépose un invité
                  pour l’attribuer.
                </p>
              </div>

              {saving && (
                <span className="rounded-full bg-[#FFF6DE] px-3 py-2 text-xs font-black text-[#B88900]">
                  Enregistrement...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
              {tables.map((table) => (
                <TableCard
                  key={table.number}
                  table={table}
                  active={selectedTable === table.number}
                  draggedGuest={draggedGuest}
                  onClick={() => setSelectedTable(table.number)}
                  onDropGuest={(guest) => assignGuestToTable(guest, table.number)}
                />
              ))}
            </div>
          </section>
        </section>

        {selectedTableData && (
          <TableModal
            table={selectedTableData}
            onClose={() => setSelectedTable(null)}
            onRemove={removeGuestFromTable}
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

function HeaderStat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function CreatorCheck({ creator, checked, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-[24px] border p-3 ${
        checked
          ? "border-[#B88900] bg-[#111827] text-white"
          : "border-[#EEE1C6] bg-[#FFFDF8]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-[#B88900]"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-black">{creator.name}</p>
        <p className={checked ? "text-xs text-white/60" : "text-xs text-gray-500"}>
          {creator.billets} billet(s)
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-1 text-xs font-black ${
          checked
            ? "bg-[#F5C542] text-[#111827]"
            : "bg-[#FFF6DE] text-[#B88900]"
        }`}
      >
        {creator.places}
      </span>
    </label>
  );
}
function GuestDraggableCard({ guest, onDragStart, onDragEnd }) {
  const isCouple = guest.ticket_type === "couple";
  const places = isCouple ? 2 : 1;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-[28px] border border-[#EEE1C6] bg-[#FFFDF8] p-4 shadow-sm active:cursor-grabbing active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black ${
            isCouple
              ? "bg-rose-50 text-rose-700"
              : "bg-[#FFF6DE] text-[#B88900]"
          }`}
        >
          {places}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-black">{guest.display_name}</p>

          <p className="text-xs text-gray-500">
            {isCouple ? "Couple · 2 places" : "Single · 1 place"}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#B88900]">
            <UserPlus size={13} />
            {guest.created_by_username || "Non renseigné"}
          </p>
        </div>
      </div>
    </div>
  );
}

function TableCard({ table, active, draggedGuest, onClick, onDropGuest }) {
  const percent = Math.min(
    100,
    Math.round((table.usedPlaces / MAX_PLACES_PER_TABLE) * 100)
  );

  const canDrop =
    draggedGuest &&
    table.usedPlaces +
      (draggedGuest.ticket_type === "couple" ? 2 : 1) <=
      MAX_PLACES_PER_TABLE;

  const isBlocked = draggedGuest && !canDrop;

  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedGuest) {
          onDropGuest(draggedGuest);
        }
      }}
      className={`rounded-[28px] border p-3 text-left transition active:scale-[0.98] ${
        active
          ? "border-[#111827] bg-[#111827] text-white shadow-xl"
          : isBlocked
          ? "border-red-200 bg-red-50"
          : canDrop
          ? "border-emerald-300 bg-emerald-50"
          : table.isFull
          ? "border-red-100 bg-red-50"
          : "border-[#EEE1C6] bg-[#FFFDF8]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-black">T{table.number}</p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black ${
            active
              ? "bg-[#F5C542] text-[#111827]"
              : table.isFull
              ? "bg-red-100 text-red-700"
              : "bg-[#FFF6DE] text-[#B88900]"
          }`}
        >
          {table.usedPlaces}/{MAX_PLACES_PER_TABLE}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1">
        {Array.from({ length: MAX_PLACES_PER_TABLE }).map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded-full ${
              index < table.usedPlaces
                ? active
                  ? "bg-[#F5C542]"
                  : "bg-[#B88900]"
                : active
                ? "bg-white/20"
                : "bg-[#E9DEC1]"
            }`}
          />
        ))}
      </div>

      <div className="mt-3 h-2 rounded-full bg-black/10">
        <div
          className={`h-2 rounded-full ${
            table.isFull
              ? "bg-red-500"
              : active
              ? "bg-[#F5C542]"
              : "bg-[#B88900]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p
        className={`mt-2 text-xs font-bold ${
          active ? "text-white/60" : "text-gray-500"
        }`}
      >
        {table.members.length} billet(s)
      </p>
    </button>
  );
}

function TableModal({ table, onClose, onRemove }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 px-4 pb-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md rounded-[38px] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B88900]">
              Détail table
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Table {table.number}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {table.usedPlaces}/{MAX_PLACES_PER_TABLE} places occupées ·{" "}
              {table.freePlaces} place(s) libre(s)
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-8 gap-1">
          {Array.from({ length: MAX_PLACES_PER_TABLE }).map((_, index) => (
            <div
              key={index}
              className={`h-4 rounded-full ${
                index < table.usedPlaces ? "bg-[#B88900]" : "bg-[#E9DEC1]"
              }`}
            />
          ))}
        </div>

        {table.members.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#D6C49B] bg-[#FFFDF8] p-8 text-center">
            <Armchair className="mx-auto text-[#B88900]" size={40} />

            <p className="mt-4 font-black">Table vide</p>

            <p className="mt-1 text-sm text-gray-500">
              Glisse un invité depuis la liste pour l’ajouter ici.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {table.members.map((guest) => {
              const isCouple = guest.ticket_type === "couple";
              const places = isCouple ? 2 : 1;

              return (
                <div
                  key={guest.id}
                  className="rounded-[28px] border border-[#EEE1C6] bg-[#FFFDF8] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black ${
                        isCouple
                          ? "bg-rose-50 text-rose-700"
                          : "bg-[#FFF6DE] text-[#B88900]"
                      }`}
                    >
                      {places}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black">
                        {guest.display_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {isCouple ? "Couple · 2 places" : "Single · 1 place"}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#B88900]">
                        <UserPlus size={13} />
                        {guest.created_by_username || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemove(guest)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 active:scale-[0.98]"
                  >
                    <Trash2 size={17} />
                    Retirer de la table
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[26px] bg-[#111827] py-4 font-black text-[#F5C542] active:scale-[0.98]"
        >
          <CheckCircle2 size={19} />
          Terminer
        </button>
      </div>
    </div>
  );
}

export default Tables;