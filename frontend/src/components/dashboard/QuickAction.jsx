function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-3xl bg-white border border-[#E8D8A8] p-4 shadow-md active:scale-95 transition"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#A67C00]">
        {icon}
      </div>

      <div className="text-left">
        <p className="font-bold text-[#2B1A1A]">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}

export default QuickAction;