import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db" // ojo con la ruta según tu estructura

// GET: devolver horarios disponibles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get("date")

  if (!fecha) {
    return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 })
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, hora_inicio, hora_fin 
       FROM horarios_disponibles 
       WHERE fecha = ? AND disponible = 1`,
      [fecha],
    )
    return NextResponse.json({ slots: rows }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: crear reserva
export async function POST(request: NextRequest) {
  const { nombre, email, telefono, fecha, hora_inicio, hora_fin } = await request.json()

  if (!nombre || !email || !fecha || !hora_inicio || !hora_fin) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  try {
    // Validar que el horario existe y está disponible
    const [rows] = await db.execute(
      `SELECT id 
       FROM horarios_disponibles 
       WHERE fecha = ? AND hora_inicio = ? AND hora_fin = ? AND disponible = 1`,
      [fecha, hora_inicio, hora_fin],
    )

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "El horario seleccionado no está disponible" }, { status: 409 })
    }

    // Insertar la reserva
    await db.execute(
      `INSERT INTO reservas (nombre, email, telefono, fecha, hora_inicio, hora_fin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, telefono || null, fecha, hora_inicio, hora_fin],
    )

    // Marcar horario como ocupado
    await db.execute(
      `UPDATE horarios_disponibles 
       SET disponible = 0 
       WHERE fecha = ? AND hora_inicio = ? AND hora_fin = ?`,
      [fecha, hora_inicio, hora_fin],
    )

    return NextResponse.json({ message: "Reserva creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
