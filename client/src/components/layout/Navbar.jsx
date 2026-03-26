import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { logoutUser } from "../../features/auth/authSlice";
import useAuth from "../../hooks/useAuth";
import ConfirmModal from "../common/ConfirmModal";

const Navbar = ({ title, onOpenSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await dispatch(logoutUser());
    setLoggingOut(false);
    setOpenLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-slate-500 md:block">
          Welcome,{" "}
          <span className="font-medium text-slate-800">{user?.name}</span>
        </span>
        <button
          type="button"
          onClick={() => setOpenLogoutConfirm(true)}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 sm:px-4"
        >
          <LogOut size={16} className="shrink-0" />
          Logout
        </button>
      </div>

      <ConfirmModal
        isOpen={openLogoutConfirm}
        onClose={() => setOpenLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmVariant="danger"
        loading={loggingOut}
      />
    </header>
  );
};

export default Navbar;
