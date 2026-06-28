import { Link } from "react-router-dom";

function GuestCard({ guest }) {
  return (
    <Link
      to={`/guests/${guest.slug}`}
      className="block bg-white rounded-3xl border border-[#E8D8A8] shadow p-5 mb-4 active:scale-[0.98] transition"
    >
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg">{guest.display_name}</h3>
          <p className="text-gray-500">
            {guest.ticket_type === "couple" ? "Billet Couple" : "Billet Single"}
          </p>
        </div>

        <span className="bg-[#FFF8E1] text-[#A67C00] px-3 py-2 rounded-full text-xs font-bold h-fit border border-[#E8D8A8]">
          {guest.places} place(s)
        </span>
      </div>

      <hr className="my-4" />

      <p>📞 {guest.phone || "Non renseigné"}</p>
      <p>🪑 {guest.table_number ? `Table ${guest.table_number}` : "Non attribuée"}</p>

      <p className="text-xs mt-3 text-[#A67C00]">
        Voir le billet →
      </p>
    </Link>
  );
}

export default GuestCard;