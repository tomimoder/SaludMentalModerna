import { type NextRequest, NextResponse } from "next/server"
import db from "../../../../lib/db"

// GET /api/admin/availability
// Devuelve los horarios disponibles registrados para revisarlos en el panel (opcional).
export async function GET() {
  try {
    const [rows] = await db.execute(
      "SELECT id, therapist_id, fecha, hora_inicio, hora_fin, disponible FROM horarios_disponibles ORDER BY fecha, hora_inicio",
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

// POST /api/admin/availability
// Permite al administrador registrar nuevas disponibilidades para un terapeuta.
export async function POST(request: NextRequest) {
  try {
    const { therapist_id, date, start_time, end_time } = await request.json()
    // Insertar la disponibilidad. Se marca como disponible por defecto (1)
    await db.execute(
      "INSERT INTO horarios_disponibles (therapist_id, fecha, hora_inicio, hora_fin, disponible) VALUES (?, ?, ?, ?, 1)",
      [therapist_id, date, start_time, end_time],
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding availability:", error)
    return NextResponse.json({ error: "Failed to add availability" }, { status: 500 })
  }
}
