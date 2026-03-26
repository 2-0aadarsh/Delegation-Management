import { getDB } from "../config/db.js";

// System-wide status distribution
export const getStatusStats = async () => {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT status, COUNT(*) AS count
    FROM delegations
    GROUP BY status
  `);
  return rows;
};

// Status distribution for a single user's assigned delegations
export const getStatusStatsByUser = async (userId) => {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT status, COUNT(*) AS count
     FROM delegations
     WHERE assigned_to = ?
     GROUP BY status`,
    [userId]
  );
  return rows;
};

// How many delegations each user has assigned to them
export const getUserStats = async () => {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT u.name, COUNT(d.id) AS total_tasks
    FROM users u
    LEFT JOIN delegations d ON u.id = d.assigned_to
    GROUP BY u.id, u.name
    ORDER BY total_tasks DESC
  `);
  return rows;
};

// System-wide delegations created over time
export const getDelegationsOverTime = async () => {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM delegations
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);
  return rows;
};

// Delegations over time for a single user
export const getDelegationsOverTimeByUser = async (userId) => {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM delegations
     WHERE assigned_to = ?
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [userId]
  );
  return rows;
};
