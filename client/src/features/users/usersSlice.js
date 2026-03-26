import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/all-users");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const createAdmin = createAsyncThunk(
  "users/createAdmin",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/create-admin", userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create admin");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/create-user", userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create user");
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      return { id, role };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update role");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUsersError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.users.unshift(action.payload); // Add to top of list
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { id, role } = action.payload;
        const user = state.users.find((u) => u.id === id);
        if (user) user.role = role;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
