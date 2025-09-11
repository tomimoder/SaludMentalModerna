import { type NextRequest, NextResponse } from "next/server"
import  db  from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorName, authorEmail } = await request.json()

    if (!questionId || !answer || !authorName) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Insert the answer
    const [result] = await db.execute(
      `INSERT INTO question_answers (question_id, answer, author_name, author_email, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [questionId, answer, authorName, authorEmail || null],
    )

    return NextResponse.json({
      success: true,
      answerId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error adding answer:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("questionId")

    if (!questionId) {
      return NextResponse.json({ error: "Question ID requerido" }, { status: 400 })
    }

    const [answers] = await db.execute(
      `SELECT id, answer, author_name, author_email, created_at
       FROM question_answers 
       WHERE question_id = ?
       ORDER BY created_at DESC`,
      [questionId],
    )

    return NextResponse.json(answers)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const answerId = searchParams.get("answerId")

    if (!answerId) {
      return NextResponse.json({ error: "Answer ID requerido" }, { status: 400 })
    }

    await db.execute(`DELETE FROM question_answers WHERE id = ?`, [answerId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting answer:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
