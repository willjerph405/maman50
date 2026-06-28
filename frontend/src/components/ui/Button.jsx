function Button({ children, type = "button", onClick, variant = "primary" }) {
  const base =
    "w-full rounded-2xl py-4 px-5 font-bold transition active:scale-95";

  const styles = {
    primary: "bg-[#C9A227] text-white shadow-lg",
    outline: "bg-white border border-[#C9A227] text-[#A67C00]",
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

export default Button;