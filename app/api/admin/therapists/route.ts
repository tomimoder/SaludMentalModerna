import { type NextRequest, NextResponse } from "next/server"
import db from "../../../../lib/db"


// Devuelve la lista de terapeutas registrados para que el administrador pueda asignarles horarios disponibles.
export async function GET() {
  try {
    const [rows] = await db.execute(
      "SELECT id, name FROM users WHERE role = 'therapist' ORDER BY name ASC",
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching therapists:", error)
    return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 })
  }
}
