import { forwardRef } from "react";

const Card = forwardRef(function Card(
  {
    children,
    className = "",
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-3xl border border-[#E8D8A8] shadow-lg ${className}`}
    >
      {children}
    </div>
  );
});

export default Card;