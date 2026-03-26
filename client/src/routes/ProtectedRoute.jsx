import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

// Blocks access to any route for unauthenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();

  // Wait for /auth/me to resolve before making a redirect decision
  if (!initialized) return <Loader fullScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
