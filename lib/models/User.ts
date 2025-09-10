import pool from "../db"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface User {
  id: number
  email: string
  name: string
  role: "user" | "admin" | "therapist"
  created_at: Date
  updated_at: Date
}

export class UserModel {
  static async create(userData: {
    email: string
    password: string
    name: string
    role?: string
  }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
      [userData.email, userData.password, userData.name, userData.role || "user"],
    )
    return result.insertId
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, name, role, created_at, updated_at FROM users WHERE email = ?",
      [email],
    )
    return rows.length > 0 ? (rows[0] as User) : null
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?",
      [id],
    )
    return rows.length > 0 ? (rows[0] as User) : null
  }
}
