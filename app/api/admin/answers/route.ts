import { type NextRequest, NextResponse } from "next/server"
import  db  from "@/lib/db"

export async function GET() {
  try {
    const [answers] = await db.execute(`
      SELECT qa.*, q.question 
      FROM question_answers qa
      JOIN questions q ON qa.question_id = q.id
      ORDER BY qa.created_at DESC
    `)

    return NextResponse.json(answers)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, is_approved } = await request.json()

    if (!id || is_approved === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    await db.execute("UPDATE question_answers SET is_approved = ? WHERE id = ?", [is_approved ? 1 : 0, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating answer:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    await db.execute("DELETE FROM question_answers WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting answer:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
