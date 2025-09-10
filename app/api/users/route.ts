import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    // Validar datos requeridos
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password y name son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const userId = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      role,
    })

    return NextResponse.json({ message: "Usuario creado exitosamente", userId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
