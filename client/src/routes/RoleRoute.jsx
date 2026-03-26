import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// allowedRoles: array of role strings e.g. ["admin","superadmin"]
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
