import mysql from "mysql2/promise"

// Configuración de la conexión a MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root", // o 'root' si tienes contraseña
  database: "mental",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig)

export default pool
