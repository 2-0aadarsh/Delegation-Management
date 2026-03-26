import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import delegationsReducer from "../features/delegations/delegationsSlice";
import reportsReducer from "../features/reports/reportsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    delegations: delegationsReducer,
    reports: reportsReducer,
  },
});
