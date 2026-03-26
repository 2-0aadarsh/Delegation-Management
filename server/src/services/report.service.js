import {
  getStatusStats,
  getStatusStatsByUser,
  getUserStats,
  getDelegationsOverTime,
  getDelegationsOverTimeByUser,
} from "../models/report.model.js";
import { ROLES } from "../constants/roles.js";

export const getReportsService = async (user) => {
  // Super Admin — full system-wide picture + per-user workload chart
  if (user.role === ROLES.SUPER_ADMIN) {
    const [statusStats, userStats, timeStats] = await Promise.all([
      getStatusStats(),
      getUserStats(),
      getDelegationsOverTime(),
    ]);
    return { statusStats, userStats, timeStats };
  }

  // Admin — sees same system-wide status + timeline as super admin; no cross-user workload aggregate
  if (user.role === ROLES.ADMIN) {
    const [statusStats, timeStats] = await Promise.all([
      getStatusStats(),
      getDelegationsOverTime(),
    ]);
    return { statusStats, userStats: null, timeStats };
  }

  // Regular user — only delegations assigned to them
  const [statusStats, timeStats] = await Promise.all([
    getStatusStatsByUser(user.id),
    getDelegationsOverTimeByUser(user.id),
  ]);
  return { statusStats, userStats: null, timeStats };
};
