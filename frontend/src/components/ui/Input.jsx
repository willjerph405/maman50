function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-2 block text-sm font-semibold">{label}</label>}
      <input
        {...props}
        className="w-full rounded-2xl border border-[#E8D8A8] bg-white px-4 py-3 outline-none focus:border-[#C9A227]"
      />
    </div>
  );
}

export default Input;