import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchDelegations = createAsyncThunk(
  "delegations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/delegations");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch delegations");
    }
  }
);

export const fetchRecentDelegations = createAsyncThunk(
  "delegations/fetchRecent",
  async ({ limit = 5, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/delegations/recent?limit=${limit}&offset=${offset}`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch recent delegations");
    }
  }
);

export const createDelegation = createAsyncThunk(
  "delegations/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/delegations/create", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create delegation");
    }
  }
);

export const updateDelegationStatus = createAsyncThunk(
  "delegations/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await api.put(`/delegations/${id}/status`, { status });
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

export const deleteDelegation = createAsyncThunk(
  "delegations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/delegations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete delegation");
    }
  }
);

const delegationsSlice = createSlice({
  name: "delegations",
  initialState: {
    delegations: [],
    recentDelegations: [],
    loading: false,
    recentLoading: false,
    error: null,
    recentError: null,
  },
  reducers: {
    clearDelegationsError: (state) => { state.error = null; },
    clearRecentDelegationsError: (state) => { state.recentError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDelegations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDelegations.fulfilled, (state, action) => {
        state.loading = false;
        state.delegations = action.payload;
      })
      .addCase(fetchDelegations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchRecentDelegations.pending, (state) => {
        state.recentLoading = true;
        state.recentError = null;
      })
      .addCase(fetchRecentDelegations.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentDelegations = action.payload;
      })
      .addCase(fetchRecentDelegations.rejected, (state, action) => {
        state.recentLoading = false;
        state.recentError = action.payload;
      });

    builder
      .addCase(createDelegation.fulfilled, (state, action) => {
        state.delegations.unshift(action.payload);
      })
      .addCase(createDelegation.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(updateDelegationStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const delegation = state.delegations.find((d) => d.id === parseInt(id));
        if (delegation) delegation.status = status;
      })
      .addCase(updateDelegationStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteDelegation.fulfilled, (state, action) => {
        state.delegations = state.delegations.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDelegation.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDelegationsError, clearRecentDelegationsError } = delegationsSlice.actions;
export default delegationsSlice.reducer;
