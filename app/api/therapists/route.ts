import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get("date")
  const hora_inicio = searchParams.get("hora_inicio")
  const hora_fin = searchParams.get("hora_fin")

  if (!fecha || !hora_inicio || !hora_fin) {
    return NextResponse.json(
      { error: "Fecha y horario son requeridos" },
      { status: 400 }
    )
  }

  try {
    const [rows] = await db.execute(
      `SELECT t.id, t.name 
       FROM users t
       INNER JOIN horarios_disponibles h 
         ON t.id = h.therapist_id
       WHERE h.fecha = ? 
         AND h.hora_inicio = ? 
         AND h.hora_fin = ?
         AND h.disponible = 1`,
      [fecha, hora_inicio, hora_fin]
    )

    return NextResponse.json({ therapists: rows }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al obtener terapeutas" },
      { status: 500 }
    )
  }
}
