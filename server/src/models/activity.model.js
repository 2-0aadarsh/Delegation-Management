import { getDB } from "../config/db.js";

// Write an activity log entry — fire-and-forget, never throws so it can't crash a request
export const logActivity = async (userId, action) => {
  try {
    const db = getDB();
    await db.execute(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [userId, action]
    );
  } catch (error) {
    // Log to console but never propagate — a logging failure must not break business logic
    console.error("⚠️ Activity log failed:", error.message);
  }
};

// Fetch all activity logs (Super Admin)
export const getAllActivityLogs = async () => {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT al.id, al.action, al.created_at, u.name AS user_name, u.email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
  `);
  return rows;
};

// Fetch activity logs for a specific user
export const getActivityLogsByUser = async (userId) => {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, action, created_at
     FROM activity_logs
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};
