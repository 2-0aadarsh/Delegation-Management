import { getDB } from "../config/db.js";

export const createDelegation = async ({
  title,
  description,
  assigned_to,
  created_by,
}) => {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO delegations (title, description, assigned_to, created_by)
     VALUES (?, ?, ?, ?)`,
    [title, description, assigned_to, created_by]
  );

  return {
    id: result.insertId,
    title,
    description,
    assigned_to,
    created_by,
    status: "pending",
  };
};

// Shared JOIN fragment so both "all" and "by user" queries return the same shape
const DELEGATION_SELECT = `
  SELECT
    d.id, d.title, d.description, d.status, d.created_at,
    d.assigned_to,  u1.name AS assigned_to_name,
    d.created_by,   u2.name AS created_by_name
  FROM delegations d
  LEFT JOIN users u1 ON d.assigned_to = u1.id
  LEFT JOIN users u2 ON d.created_by  = u2.id
`;

export const getAllDelegations = async () => {
  const db = getDB();
  const [rows] = await db.execute(`${DELEGATION_SELECT} ORDER BY d.created_at DESC`);
  return rows;
};

// Regular user scope — delegations assigned to this user
export const getDelegationsByUser = async (userId) => {
  const db = getDB();
  const [rows] = await db.execute(
    `${DELEGATION_SELECT} WHERE d.assigned_to = ? ORDER BY d.created_at DESC`,
    [userId]
  );
  return rows;
};

// Recent delegations (limited) for dashboard
export const getAllDelegationsRecent = async (limit, offset = 0) => {
  const db = getDB();
  // MySQL sometimes doesn't accept bound params for LIMIT; interpolate after validating integer.
  const safeLimit = Number(limit);
  const safeOffset = Number(offset);
  const [rows] = await db.execute(
    `${DELEGATION_SELECT} ORDER BY d.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows;
};

// Recent delegations (limited) for a regular user
export const getDelegationsByUserRecent = async (userId, limit, offset = 0) => {
  const db = getDB();
  const safeLimit = Number(limit);
  const safeOffset = Number(offset);
  const [rows] = await db.execute(
    `${DELEGATION_SELECT} WHERE d.assigned_to = ? ORDER BY d.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    [userId]
  );
  return rows;
};

// Fetch a single delegation by ID (used for ownership checks — O(1) instead of scanning all)
export const getDelegationById = async (id) => {
  const db = getDB();
  const [rows] = await db.execute(
    `${DELEGATION_SELECT} WHERE d.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const updateDelegationStatus = async (id, status) => {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE delegations SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows;
};

export const deleteDelegation = async (id) => {
  const db = getDB();
  const [result] = await db.execute(
    `DELETE FROM delegations WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};
