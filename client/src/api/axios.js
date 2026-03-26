import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Sends the httpOnly cookie automatically on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — redirect to login on 401 for protected API calls only.
// - Never full-page redirect on /login or /register (trailing slash included): that wipes Redux
//   and hides login/register error messages.
// - Never redirect for auth/* endpoints (401 is expected for bad credentials / no session).
function pathIsLoginOrRegister() {
  const p = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  return p === "/login" || p === "/register";
}

function requestIsAuthEndpoint(config) {
  const url = String(config?.url || "");
  const base = String(config?.baseURL || "");
  let path = url;
  try {
    if (url.startsWith("http")) {
      path = new URL(url).pathname;
    } else if (base) {
      path = new URL(url.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`).pathname;
    }
  } catch {
    /* keep path as url */
  }
  const combined = `${base}${url}`;
  return (
    /\/auth\/(me|login|register)(?:\?|$)/i.test(path) ||
    /\/auth\/(me|login|register)(?:\?|$)/i.test(combined) ||
    ["auth/me", "auth/login", "auth/register"].some((s) => url.includes(s) || combined.includes(s))
  );
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onAuthPage = pathIsLoginOrRegister();
      const authCall = requestIsAuthEndpoint(error.config);

      if (!onAuthPage && !authCall) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
