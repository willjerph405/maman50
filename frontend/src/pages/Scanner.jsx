import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  UserCheck,
  ArrowLeft,
  QrCode,
  Ticket,
  Users,
  AlertTriangle,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { api } from "../api/axios";
import { EVENT } from "../config/event";
import BottomNavigation from "../components/layout/BottomNavigation";

function Scanner() {
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [search, setSearch] = useState("");
  const [scanError, setScanError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchGuests();

    return () => {
      stopCamera();
    };
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests/");
      setGuests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = useMemo(() => {
    const entered = guests.filter((guest) => guest.is_checked_in).length;

    return {
      total: guests.length,
      entered,
      waiting: guests.length - entered,
      places: guests.reduce((sum, guest) => sum + Number(guest.places || 0), 0),
    };
  }, [guests]);

  const startCamera = async () => {
    setScanError("");
    setSelectedGuest(null);
    setSuccessMessage("");
    processingRef.current = false;

    if (scannerRef.current) {
      await stopCamera();
    }

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (processingRef.current) return;

          processingRef.current = true;
          await handleQrResult(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (error) {
      console.error(error);
      setScanError(
        "Impossible d’ouvrir la caméra. Autorise la caméra ou utilise la recherche manuelle."
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // caméra déjà arrêtée
      }

      scannerRef.current = null;
    }

    setIsScanning(false);
  };

  const handleQrResult = async (decodedText) => {
    await stopCamera();

    const cleanValue = String(decodedText || "").trim();

    const found = guests.find((guest) => {
      return (
        String(guest.qr_code || "").trim() === cleanValue ||
        String(guest.id || "").trim() === cleanValue ||
        String(guest.slug || "").trim() === cleanValue
      );
    });

    if (!found) {
      setSelectedGuest(null);
      setSuccessMessage("");
      setScanError(
        "QR Code non reconnu. Ce billet est invalide ou n’appartient pas à cette liste d’invités."
      );

      setTimeout(() => {
        processingRef.current = false;
      }, 1200);

      return;
    }

    setScanError("");
    setSuccessMessage("");
    setSelectedGuest(found);

    setTimeout(() => {
      processingRef.current = false;
    }, 1200);
  };

  const validateEntry = async () => {
    if (!selectedGuest) return;

    if (selectedGuest.is_checked_in) {
      setSuccessMessage("Cet invité était déjà marqué comme entré.");
      return;
    }

    setValidating(true);

    try {
      const response = await api.post(`/guests/${selectedGuest.slug}/check_in/`);
      const updatedGuest = response.data;

      setSelectedGuest(updatedGuest);

      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === updatedGuest.id ? updatedGuest : guest
        )
      );

      setSuccessMessage("Entrée validée avec succès.");
    } catch (error) {
      console.error(error);
      alert("Impossible de valider l’entrée.");
    } finally {
      setValidating(false);
    }
  };

  const filteredGuests = useMemo(() => {
    const value = search.toLowerCase();

    return guests.filter((guest) => {
      const text = `${guest.display_name} ${guest.phone || ""} ${
        guest.email || ""
      } ${guest.qr_code || ""}`.toLowerCase();

      return text.includes(value);
    });
  }, [guests, search]);

  return (
    <div className="min-h-screen bg-[#F7F1E6] pb-32 text-[#171717]">
      <main className="mx-auto max-w-md px-5 pt-6">
        <header className="relative overflow-hidden rounded-[42px] bg-[#111827] p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F5C542]/25" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F5C542]">
              Contrôle VIP
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Scanner
              <br />
              Entrée
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Lecture fluide du QR Code avec message d’erreur si le billet est invalide.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F5C542] px-4 py-3 text-[#111827]">
              <Sparkles size={18} />
              <p className="text-sm font-black">
                {EVENT.city} · {EVENT.time} · Thème {EVENT.theme}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <HeaderStat icon={<Ticket size={18} />} label="Billets" value={stats.total} />
              <HeaderStat icon={<Users size={18} />} label="Places" value={stats.places} />
              <HeaderStat icon={<CheckCircle2 size={18} />} label="Entrés" value={stats.entered} />
              <HeaderStat icon={<AlertTriangle size={18} />} label="Attente" value={stats.waiting} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Caméra QR Code</h2>
              <p className="text-sm text-gray-500">
                Place le QR Code dans le cadre doré.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DE] text-[#B88900]">
              <QrCode size={25} />
            </div>
          </div>

          <div
            id="qr-reader"
            className={`overflow-hidden rounded-[30px] ${
              isScanning
                ? "border-4 border-[#B88900] bg-black"
                : "min-h-[220px] bg-[#111827]"
            }`}
          />

          {!isScanning ? (
            <button
              onClick={startCamera}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#111827] py-5 font-black text-[#F5C542] shadow-xl active:scale-[0.98]"
            >
              <Camera size={22} />
              Ouvrir la caméra
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-red-600 py-5 font-black text-white shadow-xl active:scale-[0.98]"
            >
              <ArrowLeft size={22} />
              Fermer la caméra
            </button>
          )}
        </section>

        {scanError && (
          <section className="mt-6 rounded-[36px] border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white">
                <XCircle size={32} />
              </div>

              <div>
                <p className="text-sm font-bold text-red-500">Erreur scan</p>
                <h2 className="text-xl font-black text-red-700">
                  Billet non reconnu
                </h2>
                <p className="mt-1 text-sm text-red-600">{scanError}</p>
              </div>
            </div>

            <button
              onClick={startCamera}
              className="mt-5 w-full rounded-[24px] bg-red-600 py-4 font-black text-white"
            >
              Recommencer le scan
            </button>
          </section>
        )}

        {selectedGuest && (
          <section
            className={`mt-6 rounded-[36px] border p-5 shadow-xl ${
              selectedGuest.is_checked_in
                ? "border-emerald-200 bg-emerald-50"
                : "border-[#EEE1C6] bg-white"
            }`}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  selectedGuest.is_checked_in
                    ? "bg-emerald-600 text-white"
                    : "bg-[#FFF6DE] text-[#B88900]"
                }`}
              >
                <CheckCircle2 size={30} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Résultat</p>
                <h2
                  className={`text-xl font-black ${
                    selectedGuest.is_checked_in
                      ? "text-emerald-700"
                      : "text-[#111827]"
                  }`}
                >
                  {selectedGuest.is_checked_in
                    ? "Déjà entré"
                    : "Billet trouvé"}
                </h2>
              </div>
            </div>

            <div className="rounded-[30px] bg-white p-5">
              <p className="text-sm text-gray-500">Invité</p>
              <p className="text-2xl font-black">{selectedGuest.display_name}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info
                  label="Type"
                  value={
                    selectedGuest.ticket_type === "couple" ? "Couple" : "Single"
                  }
                />
                <Info label="Places" value={selectedGuest.places} />
                <Info
                  label="Table"
                  value={
                    selectedGuest.table_number
                      ? `Table ${selectedGuest.table_number}`
                      : "Non attribuée"
                  }
                />
                <Info
                  label="Statut"
                  value={selectedGuest.is_checked_in ? "Entré" : "À valider"}
                />
              </div>

              <div className="mt-3 rounded-2xl bg-[#FFF6DE] p-3">
                <p className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500">
                  <UserPlus size={13} />
                  Créé par
                </p>
                <p className="font-black text-[#B88900]">
                  {selectedGuest.created_by_username || "Non renseigné"}
                </p>
              </div>
            </div>

            <button
              onClick={validateEntry}
              disabled={validating || selectedGuest.is_checked_in}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[28px] bg-emerald-600 py-5 font-black text-white shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              <UserCheck size={22} />
              {selectedGuest.is_checked_in
                ? "Déjà validé"
                : validating
                ? "Validation..."
                : "Valider l’entrée"}
            </button>

            {successMessage && (
              <p className="mt-4 rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-700">
                {successMessage}
              </p>
            )}
          </section>
        )}

        <section className="mt-6 rounded-[36px] border border-[#EEE1C6] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Recherche manuelle</h2>

          <div className="flex items-center gap-3 rounded-[26px] border border-[#EEE1C6] bg-[#FFFDF8] px-4 py-4">
            <Search size={20} className="text-[#B88900]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, téléphone, email ou QR..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {search && (
            <div className="mt-4 space-y-3">
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => {
                    setSelectedGuest(guest);
                    setScanError("");
                    setSuccessMessage("");
                  }}
                  className="w-full rounded-[28px] border border-[#EEE1C6] bg-[#FFFDF8] p-4 text-left active:scale-[0.98]"
                >
                  <p className="font-black">{guest.display_name}</p>
                  <p className="text-sm text-gray-500">
                    {guest.ticket_type === "couple"
                      ? "Billet Couple"
                      : "Billet Single"}{" "}
                    · {guest.places} place(s)
                  </p>
                  <p className="text-xs text-gray-400">
                    {guest.phone || "Téléphone non renseigné"}
                  </p>
                </button>
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

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F7F1E6] p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}

export default Scanner;