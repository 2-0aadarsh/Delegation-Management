import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";


let pool;

const DB_TIMEZONE = process.env.DB_TIMEZONE || "+05:30";

export const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // How mysql2 maps JS Dates ↔ MySQL (use same offset as session below)
      timezone: DB_TIMEZONE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // MySQL TIMESTAMP / CURRENT_TIMESTAMP follow the *session* time_zone.
    // Railway's default session is usually UTC; the SQL editor SET only lasts for that tab.
    pool.on("connection", (conn) => {
      conn.query(`SET time_zone = ?`, [DB_TIMEZONE], (err) => {
        if (err) console.error("⚠️ SET time_zone failed:", err.message);
      });
    });

    const connection = await pool.getConnection();
    connection.release();

    console.log("✅ MySQL Connected successfully");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return pool;
};
