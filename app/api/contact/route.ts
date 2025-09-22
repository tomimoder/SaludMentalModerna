export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import db from "../../../lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// POST /api/consultas
// Crea una consulta, guarda en DB y envía email a tmoderg@gmail.com
export async function POST(request: NextRequest) {
  try {
    const { nombre, email, telefono, motivoConsulta } = await request.json();

    // Validaciones básicas
    if (!nombre || !email || !motivoConsulta) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }
    if (!isValidEmail(String(email))) {
      return NextResponse.json(
        { ok: false, error: "Email no válido." },
        { status: 400 }
      );
    }

    // 1) Guardar en DB
    const [result]: any = await db.execute(
      "INSERT INTO consultas (nombre, email, telefono, motivo_consulta, fecha_creacion, estado) VALUES (?, ?, ?, ?, NOW(), 'pendiente')",
      [String(nombre).trim(), String(email).trim(), String(telefono || ""), String(motivoConsulta).trim()]
    );
    const insertId = result?.insertId;

    // 2) Enviar correo
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM, // tu Gmail remitente
        pass: process.env.MAIL_PASS, // contraseña de aplicación (16 dígitos)
      },
    });

    const to = process.env.MAIL_TO || "tmoderg@gmail.com";
    const from = process.env.MAIL_FROM!;
    const subject = `Nueva consulta de ${nombre}`;
    const text = `
Nueva consulta desde Salud Mental Moderna
------------------------------------------------:

Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono || "(no indicado)"}

Motivo/Consulta:
${motivoConsulta}
(Consulta #${insertId})
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || "(no indicado)"}</p>
        <p><strong>Motivo/Consulta:</strong></p>
        <pre style="white-space:pre-wrap">${motivoConsulta}</pre>
        <p style="color:#666">ID consulta: #${insertId}</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: String(email).trim(), // responder va al usuario
    });

    return NextResponse.json({ ok: true, id: insertId }, { status: 201 });
  } catch (err) {
    console.error("Error en POST /api/consultas:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la consulta ni enviar el correo." },
      { status: 500 }
    );
  }
}