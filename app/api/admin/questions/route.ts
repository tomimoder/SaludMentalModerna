import { type NextRequest, NextResponse } from "next/server"
import  db  from "../../../../lib/db"

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT id, question, answer, category, frequency, is_faq, created_at 
      FROM questions 
      ORDER BY frequency DESC, created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching admin questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, answer, is_faq } = await request.json()

    await db.execute("UPDATE questions SET answer = ?, is_faq = ? WHERE id = ?", [answer, is_faq ? 1 : 0, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    await db.execute("DELETE FROM questions WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
