export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import db from "../../../lib/db";

// Utilidad simple para validar email
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Convierte "2025-09-23","12:41:00","15:45:00" -> Date inicio (America/Santiago) y duración en minutos
function buildStartAndDuration(fecha: string, hora_inicio: string, hora_fin: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hi, mi, si = 0] = hora_inicio.split(":").map(Number);
  const [hf, mf, sf = 0] = hora_fin.split(":").map(Number);
  // Construimos Date en hora local Chile (-03:00 aprox; ajusta si manejas DST)
  const startLocal = new Date(y, (m - 1), d, hi, mi, si);
  const endLocal = new Date(y, (m - 1), d, hf, mf, sf);
  const minutes = Math.max(1, Math.round((endLocal.getTime() - startLocal.getTime()) / 60000));
  return { startLocal, minutes };
}

// Formatea legible CL
function formatCL(dt: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(dt);
}

// ICS básico
function buildICS({
  uid,
  title,
  description,
  location,
  start,
  minutes,
}: {
  uid: string;
  title: string;
  description: string;
  location?: string;
  start: Date;
  minutes: number;
}) {
  const toICS = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");
    return `${y}${m}${day}T${hh}${mm}${ss}Z`;
  };
  const dtend = new Date(start.getTime() + minutes * 60000);
  const now = new Date();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TuSitio//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICS(now)}`,
    `DTSTART:${toICS(start)}`,
    `DTEND:${toICS(dtend)}`,
    `SUMMARY:${title.replace(/\r?\n/g, " ")}`,
    `DESCRIPTION:${description.replace(/\r?\n/g, "\\n")}`,
    location ? `LOCATION:${location.replace(/\r?\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\n");
}

// GET: devolver horarios disponibles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get("date")

  if (!fecha) {
    return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 })
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, hora_inicio, hora_fin 
       FROM horarios_disponibles 
       WHERE fecha = ? AND disponible = 1`,
      [fecha],
    )
    return NextResponse.json({ slots: rows }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: crear reserva
export async function POST(req: NextRequest) {
  try {
    // Espera estos campos
    const {
      nombre,
      email,
      telefono,
      fecha,         // "yyyy-MM-dd"
      hora_inicio,   // "HH:mm:ss"
      hora_fin,      // "HH:mm:ss"
      therapist_id,  // opcional
      terapeutaNombre, // opcional (si ya lo tienes en el frontend)
      ubicacion,       // opcional
      notas,           // opcional
    } = await req.json();

    // Validaciones mínimas
    if (!nombre || !email || !fecha || !hora_inicio || !hora_fin) {
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

    // Si no te interesa guardar el terapeuta en DB (tu tabla no lo tiene), lo usamos solo para el correo
    let terapeutaLabel = terapeutaNombre || "";

    // Guardar en tu tabla EXACTA (sin terapeuta):
    const [result]: any = await db.execute(
      `INSERT INTO reservas (nombre, email, telefono, fecha, hora_inicio, hora_fin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(nombre).trim(),
        String(email).trim(),
        String(telefono || "").trim(),
        String(fecha).trim(),
        String(hora_inicio).trim(),
        String(hora_fin).trim(),
      ]
    );
    const reservaId = result?.insertId;

    // Marcar horario como ocupado
    await db.execute(
      `UPDATE horarios_disponibles 
       SET disponible = 0 
       WHERE fecha = ? AND hora_inicio = ? AND hora_fin = ?`,
      [fecha, hora_inicio, hora_fin],
    )


    // Armar fechas y duración para correos e ICS
    const { startLocal, minutes } = buildStartAndDuration(fecha, hora_inicio, hora_fin);
    const cuandoTxt = formatCL(startLocal);

    // Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_PASS,
      },
    });

    const from = process.env.MAIL_FROM!;
    const toAdmin = process.env.MAIL_TO || "tmoderg@gmail.com";

    // 1) Correo admin
    await transporter.sendMail({
      from,
      to: toAdmin,
      subject: `Nueva reserva #${reservaId} - ${nombre}${terapeutaLabel ? ` con ${terapeutaLabel}` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Nueva reserva</h2>
          <p><strong>Cliente:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || "(no indicado)"}</p>
          ${terapeutaLabel ? `<p><strong>Terapeuta:</strong> ${terapeutaLabel}</p>` : ""}
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Horario:</strong> ${hora_inicio} - ${hora_fin} (${cuandoTxt})</p>
          ${ubicacion ? `<p><strong>Ubicación:</strong> ${ubicacion}</p>` : ""}
          ${notas ? `<p><strong>Notas:</strong> ${notas}</p>` : ""}
          <p style="color:#666">ID reserva: #${reservaId}</p>
        </div>
      `.trim(),
      text: `
Nueva reserva

Cliente: ${nombre}
Email: ${email}
Teléfono: ${telefono || "(no indicado)"}
${terapeutaLabel ? `Terapeuta: ${terapeutaLabel}\n` : ""}Fecha: ${fecha}
Horario: ${hora_inicio} - ${hora_fin} (${cuandoTxt})
${ubicacion ? `Ubicación: ${ubicacion}\n` : ""}${notas ? `Notas: ${notas}\n` : ""}ID reserva: #${reservaId}
      `.trim(),
      replyTo: email,
    });

    // 2) Correo confirmación al usuario + ICS
    const ics = buildICS({
      uid: `reserva-${reservaId}@tusitio`,
      title: `Cita${terapeutaLabel ? ` con ${terapeutaLabel}` : ""}`,
      description: `Cita agendada a través de ${process.env.NEXT_PUBLIC_SITE_NAME || "nuestro sitio"}.`,
      location: ubicacion || "",
      start: startLocal,
      minutes,
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: `Confirmación de reserva${terapeutaLabel ? ` con ${terapeutaLabel}` : ""} — ${cuandoTxt}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>¡Reserva confirmada!</h2>
          <p>Hola ${nombre},</p>
          <p>Tu cita ha sido agendada correctamente.</p>
          <ul>
            ${terapeutaLabel ? `<li><strong>Terapeuta:</strong> ${terapeutaLabel}</li>` : ""}
            <li><strong>Fecha:</strong> ${fecha}</li>
            <li><strong>Horario:</strong> ${hora_inicio} - ${hora_fin} <em>(${cuandoTxt})</em></li>
          </ul>
          <p>Adjuntamos un archivo de calendario (.ics) para que puedas agregar la cita a tu calendario.</p>
          <p>Si necesitas reprogramar o cancelar, responde a este correo.</p>
        </div>
      `.trim(),
      text: `
Hola ${nombre},

Tu cita ha sido agendada:

${terapeutaLabel ? `Terapeuta: ${terapeutaLabel}\n` : ""}Fecha: ${fecha}
Horario: ${hora_inicio} - ${hora_fin} (${cuandoTxt})

Adjuntamos un archivo .ics para agregar al calendario.
Si necesitas reprogramar/cancelar, responde a este correo.
      `.trim(),
      attachments: [
        {
          filename: `reserva-${reservaId}.ics`,
          content: ics,
          contentType: "text/calendar; charset=utf-8",
        },
      ],
      replyTo: toAdmin,
    });

    return NextResponse.json({ ok: true, id: reservaId }, { status: 201 });
  } catch (err) {
    console.error("Error en POST /api/reservas:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo crear la reserva ni enviar correos." },
      { status: 500 }
    );
  }
}
