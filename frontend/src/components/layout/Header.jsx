import { EVENT } from "../../config/event";

function Header() {
  return (
    <header className="bg-gradient-to-b from-[#FFFBEF] to-white border-b border-[#E8D8A8]">

      <div className="max-w-md mx-auto px-5 pt-8 pb-6">

        <p className="text-sm text-gray-500">
          Bonjour Will 👋
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-[#A67C00]">
          {EVENT.title}
        </h1>

        <p className="text-lg text-gray-700 mt-1">
          {EVENT.celebrant}
        </p>

        <div className="mt-6 rounded-3xl bg-[#FFF8E1] border border-[#E8D8A8] p-5">

          <p className="text-sm text-gray-500">
            Événement
          </p>

          <p className="text-xl font-bold text-[#A67C00] mt-1">
            {EVENT.subtitle}
          </p>

          <p className="text-sm mt-3 text-gray-600">
            📅 {EVENT.date}
          </p>

          <p className="text-sm text-gray-600">
            📍 {EVENT.city}
          </p>

        </div>

      </div>

    </header>
  );
}

export default Header;