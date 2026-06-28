import { EVENT } from "../../config/event";

function CountdownCard() {
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-[#FFF8E1] to-white border border-[#E8D8A8] p-6 shadow-lg">
      <p className="text-sm text-gray-500">Événement</p>

      <h2 className="mt-2 text-3xl font-extrabold text-[#A67C00]">
        {EVENT.title}
      </h2>

      <p className="text-gray-700">{EVENT.celebrant}</p>

      <div className="mt-5 rounded-3xl bg-white border border-[#E8D8A8] p-4 text-center">
        <p className="text-sm text-gray-500">Date prévue</p>
        <p className="mt-1 text-xl font-bold text-[#A67C00]">
          {EVENT.date}
        </p>
      </div>
    </div>
  );
}

export default CountdownCard;