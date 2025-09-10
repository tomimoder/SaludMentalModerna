import pool from "../db"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface TherapySession {
  id: number
  user_id: number
  therapist_id?: number
  title: string
  description?: string
  session_date: Date
  duration: number
  status: "scheduled" | "completed" | "cancelled"
  created_at: Date
}

export class TherapySessionModel {
  static async create(sessionData: {
    user_id: number
    therapist_id?: number
    title: string
    description?: string
    session_date: Date
    duration?: number
  }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO therapy_sessions (user_id, therapist_id, title, description, session_date, duration) VALUES (?, ?, ?, ?, ?, ?)",
      [
        sessionData.user_id,
        sessionData.therapist_id || null,
        sessionData.title,
        sessionData.description || null,
        sessionData.session_date,
        sessionData.duration || 60,
      ],
    )
    return result.insertId
  }

  static async findByUserId(userId: number): Promise<TherapySession[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM therapy_sessions WHERE user_id = ? ORDER BY session_date DESC",
      [userId],
    )
    return rows as TherapySession[]
  }
}
