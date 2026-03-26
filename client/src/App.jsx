import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Loader from "./components/common/Loader";

// All page-level components are lazy-loaded → automatic code splitting per route
// Each page chunk only downloads when the user actually navigates to that route
const Login       = lazy(() => import("./pages/Auth/Login"));
const Register    = lazy(() => import("./pages/Auth/Register"));
const Dashboard   = lazy(() => import("./pages/Dashboard"));
const Users       = lazy(() => import("./pages/Users"));
const Delegations = lazy(() => import("./pages/Delegations"));
const Reports     = lazy(() => import("./pages/Reports"));
const NotFound    = lazy(() => import("./pages/NotFound"));

const App = () => {
  const dispatch = useDispatch();

  // On first mount, call /auth/me to rehydrate user from the httpOnly cookie.
  // ProtectedRoute waits for `initialized` to be true before making any redirect.
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Suspense boundary covers all lazy page loads */}
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — require valid cookie session */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/delegations"
            element={
              <ProtectedRoute>
                <Delegations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Role-restricted — admin and superadmin only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin", "superadmin"]}>
                  <Users />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
