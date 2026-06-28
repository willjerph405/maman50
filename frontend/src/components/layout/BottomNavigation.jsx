import { NavLink } from "react-router-dom";
import {
  House,
  Users,
  QrCode,
  Armchair,
  UserCircle,
} from "lucide-react";

function BottomNavigation() {
  const items = [
    { label: "Accueil", path: "/", icon: House },
    { label: "Invités", path: "/guests/manage", icon: Users },
    { label: "Scan", path: "/scanner", icon: QrCode },
    { label: "Tables", path: "/tables", icon: Armchair },
    { label: "Profil", path: "/profile", icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-[30px] border border-[#E8D8A8] bg-white/90 px-3 py-3 shadow-2xl backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-w-14 flex-col items-center gap-1 rounded-[22px] px-3 py-2 text-[11px] font-black transition ${
                  isActive
                    ? "bg-[#111827] text-[#F5C542] shadow-lg"
                    : "text-gray-400 hover:text-[#B88900]"
                }`
              }
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;