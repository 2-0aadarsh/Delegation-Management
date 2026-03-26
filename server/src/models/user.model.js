import { getDB } from "../config/db.js";

export const findUserByEmail = async (email) => {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

export const createUser = async ({ name, email, password, role }) => {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [name, email, password, role]
  );

  // Return created_at immediately so the frontend can render "Joined" correctly
  const [rows] = await db.execute(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

export const getAllUsers = async () => {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
};

export const updateRole = async (id, role) => {
  const db = getDB();
  await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
};

export const deleteUser = async (id) => {
  const db = getDB();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // FK-safe cleanup: if activity_logs / delegations reference this user,
    // deleting user first will fail with foreign key constraint errors.
    await conn.execute("DELETE FROM activity_logs WHERE user_id = ?", [id]);

    await conn.execute(
      "DELETE FROM delegations WHERE assigned_to = ? OR created_by = ?",
      [id, id]
    );

    await conn.execute("DELETE FROM users WHERE id = ?", [id]);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
