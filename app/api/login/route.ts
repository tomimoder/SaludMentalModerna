import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const { password } = await req.json()
  const hashed = process.env.ADMIN_PASSWORD_HASH
  
  console.log('Valor de ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH)

  if (!hashed) {
    return NextResponse.json(
      { error: 'Falta el hash en el servidor' },
      { status: 500 }
    )
  }

  const isValid = await bcrypt.compare(password, hashed)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    )
  }

  // Si es válido → crear cookie segura de sesión
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', 'valid', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  })

  return res
}
