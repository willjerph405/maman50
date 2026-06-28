import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Ticket,
  Armchair,
  CheckCircle2,
  Crown,
  UserPlus,
  PieChart,
  TrendingUp,
  Search,
  Filter,
  Download,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const TOTAL_TABLES = 50;
const TABLE_CAPACITY = 8;

const COLORS = {
  gold: "#B88900",
  goldLight: "#F5C542",
  dark: "#111827",
  cream: "#FFF6DE",
  bg: "#F7F1E6",
  green: "#059669",
  red: "#DC2626",
  gray: "#9CA3AF",
};

function ProfileStats() {
  const navigate = useNavigate();

  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests/");
      setGuests(response.data);
    } catch (error) {
      console.error("Erreur statistiques :", error);
    }
  };

  const getPlaces = (guest) => {
    return guest.ticket_type === "couple" ? 2 : 1;
  };

  const creators = useMemo(() => {
    const names = guests.map(
      (guest) => guest.created_by_username || "Non renseigné"
    );

    return Array.from(new Set(names)).sort();
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const creator = guest.created_by_username || "Non renseigné";

      const matchesCreator =
        creatorFilter === "all" || creator === creatorFilter;

      const matchesTicket =
        ticketFilter === "all" || guest.ticket_type === ticketFilter;

      const text = `${guest.display_name} ${guest.phone || ""} ${
        guest.email || ""
      } ${creator} ${guest.table_number || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      return matchesCreator && matchesTicket && matchesSearch;
    });
  }, [guests, creatorFilter, ticketFilter, search]);

  const stats = useMemo(() => {
    const couples = filteredGuests.filter((g) => g.ticket_type === "couple");
    const singles = filteredGuests.filter((g) => g.ticket_type === "single");
    const checked = filteredGuests.filter((g) => g.is_checked_in);
    const placed = filteredGuests.filter((g) => g.table_number);

    const totalPlaces = filteredGuests.reduce(
      (sum, guest) => sum + getPlaces(guest),
      0
    );

    const checkedPlaces = checked.reduce(
      (sum, guest) => sum + getPlaces(guest),
      0
    );

    const placedPlaces = placed.reduce(
      (sum, guest) => sum + getPlaces(guest),
      0
    );

    const usedTables = new Set(
      filteredGuests.filter((g) => g.table_number).map((g) => g.table_number)
    ).size;

    return {
      guests: filteredGuests.length,
      couples: couples.length,
      singles: singles.length,
      totalPlaces,
      checked: checked.length,
      checkedPlaces,
      placed: placed.length,
      placedPlaces,
      waiting: filteredGuests.length - checked.length,
      remainingPlaces: totalPlaces - checkedPlaces,
      usedTables,
      freeTables: TOTAL_TABLES - usedTables,
      entryRate: percent(checked.length, filteredGuests.length),
      placementRate: percent(placedPlaces, totalPlaces),
      coupleRate: percent(couples.length, filteredGuests.length),
    };
  }, [filteredGuests]);

  const creatorChartData = useMemo(() => {
    const grouped = {};

    filteredGuests.forEach((guest) => {
      const creator = guest.created_by_username || "Non renseigné";

      if (!grouped[creator]) {
        grouped[creator] = {
          name: creator,
          billets: 0,
          places: 0,
          entrees: 0,
          placesTable: 0,
        };
      }

      grouped[creator].billets += 1;
      grouped[creator].places += getPlaces(guest);

      if (guest.is_checked_in) grouped[creator].entrees += 1;
      if (guest.table_number) grouped[creator].placesTable += getPlaces(guest);
    });

    return Object.values(grouped).sort((a, b) => b.places - a.places);
  }, [filteredGuests]);

  const ticketPieData = useMemo(() => {
    return [
      { name: "Couples", value: stats.couples },
      { name: "Singles", value: stats.singles },
    ];
  }, [stats]);

  const entryPieData = useMemo(() => {
    return [
      { name: "Entrés", value: stats.checked },
      { name: "En attente", value: stats.waiting },
    ];
  }, [stats]);

  const tableData = useMemo(() => {
    const tables = [];

    for (let i = 1; i <= TOTAL_TABLES; i += 1) {
      const members = filteredGuests.filter(
        (guest) => Number(guest.table_number) === i
      );

      const places = members.reduce((sum, guest) => sum + getPlaces(guest), 0);

      tables.push({
        number: i,
        name: `T${i}`,
        places,
        libres: TABLE_CAPACITY - places,
        percent: percent(places, TABLE_CAPACITY),
        full: places >= TABLE_CAPACITY,
        empty: places === 0,
      });
    }

    return tables;
  }, [filteredGuests]);

  const tableChartData = useMemo(() => {
    return tableData
      .filter((table) => table.places > 0)
      .slice(0, 15)
      .map((table) => ({
        name: table.name,
        places: table.places,
      }));
  }, [tableData]);

  const dailyCreationData = useMemo(() => {
    const grouped = {};

    filteredGuests.forEach((guest) => {
      const date = guest.created_at
        ? new Date(guest.created_at).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          })
        : "N/A";

      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += 1;
    });

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      billets: value,
    }));
  }, [filteredGuests]);
   const exportPDF = () => {
  const doc = new jsPDF("landscape", "mm", "a4");

  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text("Statistiques des invités", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(`${EVENT.celebrant} - Thème ${EVENT.theme}`, 14, 26);
  doc.text(`Export généré le ${new Date().toLocaleString("fr-FR")}`, 14, 33);

  doc.setFontSize(12);
  doc.setTextColor(184, 137, 0);

  doc.text(`Invités : ${stats.guests}`, 14, 45);
  doc.text(`Places : ${stats.totalPlaces}`, 55, 45);
  doc.text(`Entrées : ${stats.checked}`, 95, 45);
  doc.text(`Taux entrée : ${stats.entryRate}%`, 135, 45);
  doc.text(`Tables utilisées : ${stats.usedTables}/${TOTAL_TABLES}`, 185, 45);

  const rows = filteredGuests.map((guest) => [
    guest.display_name,
    guest.phone || "-",
    guest.email || "-",
    guest.ticket_type === "couple" ? "Couple" : "Single",
    getPlaces(guest),
    guest.table_number ? `Table ${guest.table_number}` : "-",
    guest.is_checked_in ? "Oui" : "Non",
    guest.created_by_username || "Non renseigné",
  ]);

  autoTable(doc, {
    startY: 55,
    head: [[
      "Nom",
      "Téléphone",
      "Email",
      "Billet",
      "Places",
      "Table",
      "Entré",
      "Créé par",
    ]],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [245, 197, 66],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [255, 248, 231],
    },
  });

  doc.save("statistiques-invites.pdf");
};

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-6xl px-4 pt-6">
        <button
          onClick={() => navigate("/profile")}
          className="mb-5 flex items-center gap-2 text-sm font-black text-[#B88900]"
        >
          <ArrowLeft size={19} />
          Retour profil
        </button>

        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-[#F5C542]">
              <BarChart3 size={34} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Analytics
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              Statistiques
              <br />
              Power BI
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              KPI globaux, graphes, affinités, tables, entrées et analyse
              complète des invitations.
            </p>

            <div className="mt-5 flex max-w-xl items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.celebrant} · Thème {EVENT.theme}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
              <HeaderKpi label="Invités" value={stats.guests} />
              <HeaderKpi label="Places" value={stats.totalPlaces} />
              <HeaderKpi label="Entrées" value={stats.checked} />
              <HeaderKpi label="Taux entrée" value={`${stats.entryRate}%`} />
              <HeaderKpi
                label="Tables"
                value={`${stats.usedTables}/${TOTAL_TABLES}`}
              />
              <HeaderKpi label="Restantes" value={stats.remainingPlaces} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Filtres dynamiques</h2>
              <p className="text-sm text-gray-500">
                Les KPI et graphes se mettent à jour selon les filtres.
              </p>
            </div>

            <button
             onClick={exportPDF}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-[#111827] px-4 py-3 text-sm font-black text-[#F5C542]"
            >
              <Download size={18} />
             Export PDF
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-[24px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4">
              <Search size={20} className="text-[#B88900]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher nom, téléphone, table..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-[24px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4">
              <UserPlus size={20} className="text-[#B88900]" />
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-full bg-transparent text-sm font-bold outline-none"
              >
                <option value="all">Tous les créateurs</option>
                {creators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-[24px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4">
              <Filter size={20} className="text-[#B88900]" />
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="w-full bg-transparent text-sm font-bold outline-none"
              >
                <option value="all">Tous les billets</option>
                <option value="single">Single</option>
                <option value="couple">Couple</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={<Users />} label="Invités" value={stats.guests} />
          <KpiCard icon={<Ticket />} label="Places" value={stats.totalPlaces} />
          <KpiCard icon={<CheckCircle2 />} label="Entrées" value={stats.checked} />
          <KpiCard icon={<TrendingUp />} label="En attente" value={stats.waiting} />
          <KpiCard icon={<Armchair />} label="Tables" value={stats.usedTables} />
          <KpiCard icon={<Crown />} label="Places restantes" value={stats.remainingPlaces} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-3">
          <ChartCard
            title="Taux clés"
            subtitle="Entrées, placement et couples"
            icon={<PieChart size={24} />}
          >
            <div className="grid grid-cols-3 gap-3">
              <Donut label="Entrées" value={stats.entryRate} />
              <Donut label="Placement" value={stats.placementRate} />
              <Donut label="Couples" value={stats.coupleRate} />
            </div>
          </ChartCard>

          <ChartCard
            title="Billets"
            subtitle="Répartition Single / Couple"
            icon={<Ticket size={24} />}
          >
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={ticketPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                  >
                    {ticketPieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={index === 0 ? COLORS.gold : COLORS.dark}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Entrées"
            subtitle="Entrés vs en attente"
            icon={<CheckCircle2 size={24} />}
          >
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={entryPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                  >
                    {entryPieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={index === 0 ? COLORS.green : COLORS.goldLight}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>
                 <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Billets créés par date"
            subtitle="Évolution des créations d’invitations"
            icon={<BarChart3 size={24} />}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCreationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4C9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="billets"
                    stroke={COLORS.gold}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Top créateurs"
            subtitle="Classement par nombre de places"
            icon={<UserPlus size={24} />}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creatorChartData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4C9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="places" fill={COLORS.gold} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="entrees" fill={COLORS.green} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Occupation des tables"
            subtitle="Vue des tables utilisées"
            icon={<Armchair size={24} />}
          />

          {tableChartData.length === 0 ? (
            <Empty text="Aucune table occupée pour le moment." />
          ) : (
            <div className="mt-5 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4C9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="places"
                    fill={COLORS.gold}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Matrice des 50 tables"
            subtitle="Vide, partielle ou pleine"
            icon={<Armchair size={24} />}
          />

          <div className="mt-5 grid grid-cols-5 gap-2 md:grid-cols-10">
            {tableData.map((table) => (
              <TableMini key={table.number} table={table} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Classement créateurs"
            subtitle="Billets, places, entrées et placement"
            icon={<Crown size={24} />}
          />

          {creatorChartData.length === 0 ? (
            <Empty text="Aucune donnée créateur." />
          ) : (
            <div className="mt-5 space-y-3">
              {creatorChartData.map((creator, index) => (
                <CreatorRow
                  key={creator.name}
                  creator={creator}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <SectionTitle
            title="Tableau détaillé"
            subtitle="Liste filtrée des invités"
            icon={<Users size={24} />}
          />

          <div className="mt-5 overflow-hidden rounded-[28px] border border-[#EEE1C6]">
            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.7fr] bg-[#111827] px-4 py-3 text-xs font-black text-[#F5C542]">
              <span>Nom</span>
              <span>Créateur</span>
              <span>Table</span>
              <span>Statut</span>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {filteredGuests.length === 0 ? (
                <div className="p-6 text-center font-black text-[#B88900]">
                  Aucun invité trouvé.
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <GuestTableRow key={guest.id} guest={guest} />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function HeaderKpi({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="rounded-[32px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
        {icon}
      </div>

      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-gray-500">{label}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
      <SectionTitle title={title} subtitle={subtitle} icon={icon} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionTitle({ title, subtitle, icon }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="text-[#B88900]">{icon}</div>
    </div>
  );
}

function Donut({ label, value }) {
  return (
    <div className="rounded-[26px] bg-[#FFFDF8] p-4 text-center">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#B88900 ${value * 3.6}deg, #F7F1E6 0deg)`,
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-black text-[#B88900]">
          {value}%
        </div>
      </div>

      <p className="mt-3 text-xs font-black">{label}</p>
    </div>
  );
}

function CreatorRow({ creator, index }) {
  const entryRate = percent(creator.entrees, creator.billets);

  return (
    <div className="rounded-[28px] bg-[#FFFDF8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black">
            #{index + 1} {creator.name}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {creator.billets} billet(s) · {creator.places} place(s)
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#FFF6DE] px-3 py-1 text-xs font-black text-[#B88900]">
          {creator.entrees} entré(s)
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
          <span>Taux d’entrée</span>
          <span>{entryRate}%</span>
        </div>

        <div className="h-3 rounded-full bg-[#F7F1E6]">
          <div
            className="h-3 rounded-full bg-[#B88900]"
            style={{ width: `${entryRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TableMini({ table }) {
  const isEmpty = table.places === 0;
  const isFull = table.places >= TABLE_CAPACITY;

  return (
    <div
      className={`rounded-2xl p-3 text-center text-xs font-black ${
        isFull
          ? "bg-red-50 text-red-600"
          : isEmpty
          ? "bg-[#F7F1E6] text-gray-400"
          : "bg-[#FFF6DE] text-[#B88900]"
      }`}
    >
      <p>T{table.number}</p>
      <p>{table.places}/8</p>
    </div>
  );
}

function GuestTableRow({ guest }) {
  const isCouple = guest.ticket_type === "couple";

  return (
    <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.7fr] border-t border-[#EEE1C6] px-4 py-3 text-xs">
      <div className="min-w-0">
        <p className="truncate font-black">{guest.display_name}</p>
        <p className="text-gray-500">
          {isCouple ? "Couple" : "Single"} · {isCouple ? 2 : 1} place(s)
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate font-bold text-[#B88900]">
          {guest.created_by_username || "Non renseigné"}
        </p>
      </div>

      <div>
        <p className="font-bold">
          {guest.table_number ? `T${guest.table_number}` : "-"}
        </p>
      </div>

      <div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black ${
            guest.is_checked_in
              ? "bg-emerald-50 text-emerald-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {guest.is_checked_in ? "Entré" : "Attente"}
        </span>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="mt-5 rounded-[28px] border border-dashed border-[#D6C49B] bg-[#FFFDF8] p-6 text-center">
      <p className="font-black text-[#B88900]">{text}</p>
    </div>
  );
}

export default ProfileStats;