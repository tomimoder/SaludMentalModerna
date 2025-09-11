import { type NextRequest, NextResponse } from "next/server"
import  db  from "@/lib/db"
import { z } from "zod"

const questionSchema = z.object({
  question: z.string().min(5).max(500),
  category: z.string().optional().default("general"),
  sessionId: z.string().optional(),
})

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT q.id, q.question, q.answer, q.category, q.frequency 
      FROM questions q 
      WHERE q.is_faq = 1 AND q.answer IS NOT NULL 
      ORDER BY q.frequency DESC, q.created_at DESC 
      LIMIT 10
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = questionSchema.parse(body)

    const [existingQuestion] = (await db.execute(
      "SELECT id, frequency FROM questions WHERE LOWER(question) LIKE LOWER(?)",
      [`%${validatedData.question}%`],
    )) as any[]

    if (existingQuestion.length > 0) {
      await db.execute("UPDATE questions SET frequency = frequency + 1 WHERE id = ?", [existingQuestion[0].id])

      if (validatedData.sessionId) {
        await db.execute("INSERT INTO question_tracking (session_id, question_id) VALUES (?, ?)", [
          validatedData.sessionId,
          existingQuestion[0].id,
        ])
      }

      return NextResponse.json({
        success: true,
        message: "Pregunta registrada",
        questionId: existingQuestion[0].id,
      })
    } else {
      const [result] = await db.execute("INSERT INTO questions (question, category, frequency) VALUES (?, ?, 1)", [
        validatedData.question,
        validatedData.category,
      ])

      const questionId = (result as any).insertId

      if (validatedData.sessionId) {
        await db.execute("INSERT INTO question_tracking (session_id, question_id) VALUES (?, ?)", [
          validatedData.sessionId,
          questionId,
        ])
      }

      return NextResponse.json({
        success: true,
        message: "Nueva pregunta registrada",
        questionId,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Error processing question:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
