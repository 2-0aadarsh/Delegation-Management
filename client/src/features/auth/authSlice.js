import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/** Human-readable message from axios / API error bodies */
function extractAuthErrorMessage(err, fallback) {
  const data = err?.response?.data;
  const status = err?.response?.status;

  if (!err?.response) {
    if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
      return "Cannot reach the server. Check that the API is running and VITE_API_URL is correct.";
    }
    return err?.message || fallback;
  }

  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (data && Array.isArray(data.message)) {
    return data.message.filter(Boolean).join(" ");
  }
  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  if (data?.errors && typeof data.errors === "object") {
    const parts = Object.values(data.errors)
      .flat()
      .filter((x) => typeof x === "string" && x.trim());
    if (parts.length) return parts.join(" ");
  }
  if (typeof data === "string" && data.trim()) return data.trim();

  if (status) return `${fallback} (HTTP ${status})`;
  return fallback;
}

// Called once on app load to rehydrate user from the httpOnly cookie
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data.data;
    } catch {
      return rejectWithValue(null); // Not an error — just not logged in
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractAuthErrorMessage(err, "Login failed"));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractAuthErrorMessage(err, "Registration failed"));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    initialized: false, // true once /me resolves — used to block render until we know auth state
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Rehydrate on app load
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload ?? null;
        state.user = user;
        state.isAuthenticated = !!user;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true; // Mark initialized even on failure — just means not logged in
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          "Login failed. Please try again.";
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          "Registration failed. Please try again.";
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
