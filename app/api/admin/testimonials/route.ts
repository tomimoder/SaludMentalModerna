import { type NextRequest, NextResponse } from "next/server"
import  db  from "../../../../lib/db"

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT id, name, email, message, rating, approved, created_at 
      FROM testimonials 
      ORDER BY created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching admin testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, approved } = await request.json()

    await db.execute("UPDATE testimonials SET approved = ? WHERE id = ?", [approved ? 1 : 0, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    await db.execute("DELETE FROM testimonials WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
