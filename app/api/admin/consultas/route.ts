import { type NextRequest, NextResponse } from "next/server"
import db from "../../../../lib/db"

// GET /api/admin/consultas
// Devuelve todas las consultas recibidas a través del formulario de contacto, ordenadas por fecha.
export async function GET() {
  try {
    const [rows] = await db.execute(
      "SELECT id, nombre, email, telefono, motivo_consulta, fecha_creacion, estado, notas, fecha_contacto FROM consultas ORDER BY fecha_creacion DESC",
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching consultas:", error)
    return NextResponse.json({ error: "Failed to fetch consultas" }, { status: 500 })
  }
}


// PATCH /api/admin/consultas
// Actualiza el estado y notas de una consulta específica.
export async function PATCH(request: NextRequest) {
  try {
    const { id, notas, estado } = await request.json()
    await db.execute(
      "UPDATE consultas SET notas = ?, estado = ?, fecha_contacto = NOW() WHERE id = ?",
      [notas, estado, id],
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating consulta:", error)
    return NextResponse.json({ error: "Failed to update consulta" }, { status: 500 })
  }
}


// DELETE /api/admin/consultas
// Elimina una consulta de la base de datos.
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await db.execute("DELETE FROM consultas WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting consulta:", error)
    return NextResponse.json({ error: "Failed to delete consulta" }, { status: 500 })
  }
}
