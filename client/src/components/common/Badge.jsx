const STATUS_STYLES = {
  pending:      "bg-amber-100 text-amber-700 border border-amber-200",
  "in-progress":"bg-blue-100 text-blue-700 border border-blue-200",
  completed:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const ROLE_STYLES = {
  superadmin: "bg-purple-100 text-purple-700 border border-purple-200",
  admin:      "bg-indigo-100 text-indigo-700 border border-indigo-200",
  user:       "bg-slate-100 text-slate-600 border border-slate-200",
};

const Badge = ({ value, type = "status" }) => {
  const styles = type === "role" ? ROLE_STYLES : STATUS_STYLES;
  const label =
    type === "role"
      ? value === "superadmin" ? "Super Admin" : value.charAt(0).toUpperCase() + value.slice(1)
      : value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[value] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
};

export default Badge;
