import { useSelector } from "react-redux";

const useAuth = () => {
  const { user, isAuthenticated, initialized, loading } = useSelector(
    (state) => state.auth
  );

  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  // Admin-level means admin OR superadmin
  const isAdminLevel = isSuperAdmin || isAdmin;

  return {
    user,
    isAuthenticated,
    initialized,
    loading,
    isSuperAdmin,
    isAdmin,
    isUser,
    isAdminLevel,
  };
};

export default useAuth;
