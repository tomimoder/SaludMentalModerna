import { type NextRequest, NextResponse } from "next/server"
import  db  from "./../../../lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, motivoConsulta } = body

    // Validar datos requeridos
    if (!nombre || !email || !telefono || !motivoConsulta) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Insertar consulta en la base de datos
    const query = `
      INSERT INTO consultas (nombre, email, telefono, motivo_consulta, fecha_creacion, estado)
      VALUES (?, ?, ?, ?, NOW(), 'pendiente')
    `

    await db.execute(query, [nombre, email, telefono, motivoConsulta])

    // Aquí puedes agregar lógica para enviar email de notificación
    // Por ejemplo, usando un servicio como Resend, SendGrid, etc.

    console.log("[v0] Nueva consulta recibida:", { nombre, email, telefono })

    return NextResponse.json(
      {
        message: "Consulta enviada exitosamente",
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error al procesar consulta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
