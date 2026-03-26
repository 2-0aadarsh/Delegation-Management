import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchReports = createAsyncThunk(
  "reports/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/reports");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch reports");
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    statusStats: [],
    userStats: [],
    timeStats: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.statusStats = action.payload.statusStats || [];
        state.userStats = action.payload.userStats || [];
        state.timeStats = action.payload.timeStats || [];
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
