import { NavLink } from "react-router-dom";
import { BarChart3, ClipboardList, LayoutDashboard, Users, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["user", "admin", "superadmin"] },
  { to: "/delegations", label: "Delegations", icon: ClipboardList, roles: ["user", "admin", "superadmin"] },
  { to: "/users", label: "Users", icon: Users, roles: ["admin", "superadmin"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["user", "admin", "superadmin"] },
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();

  const visibleLinks = NAV_LINKS.filter((link) =>
    link.roles.includes(user?.role)
  );

  const handleNav = () => {
    onMobileClose?.();
  };

  return (
    <aside
      className={[
        "fixed top-0 left-0 z-50 flex h-screen w-64 max-w-[min(16rem,85vw)] flex-col bg-slate-900 shadow-xl",
        "transition-transform duration-200 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-700 px-4 py-5 sm:px-6 sm:py-6">
        <h1 className="text-lg font-bold leading-tight text-white">
          Delegation
          <span className="block text-sm font-medium text-indigo-400">
            Management System
          </span>
        </h1>
        <button
          type="button"
          onClick={onMobileClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleNav}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:min-h-12 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <link.icon size={18} className="shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-3 py-4 sm:px-4">
        <div className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs capitalize text-slate-400">
              {user?.role === "superadmin" ? "Super Admin" : user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
