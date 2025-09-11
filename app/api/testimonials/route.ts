import { type NextRequest, NextResponse } from "next/server"
import  db  from "@/lib/db"
import { z } from "zod"

const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  rating: z.number().min(1).max(5),
})

export async function GET() {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, message, rating, created_at FROM testimonials WHERE approved = 1 ORDER BY created_at DESC LIMIT 10",
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testimonialSchema.parse(body)

    const [result] = await db.execute(
      "INSERT INTO testimonials (name, email, message, rating, approved) VALUES (?, ?, ?, ?, 0)",
      [validatedData.name, validatedData.email, validatedData.message, validatedData.rating],
    )

    return NextResponse.json({
      success: true,
      message: "Testimonio enviado para revisión",
      id: (result as any).insertId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
