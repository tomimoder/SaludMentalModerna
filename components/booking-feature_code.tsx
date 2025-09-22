
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"


// Definición de esquema de validación para el formulario de reserva.
// Reutiliza el patrón usado en ContactForm y añade selección de fecha y horario.
const bookingSchema = z.object({
  therapist_id: z.string().min(1, "Debes seleccionar un terapeuta"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  telefono: z.string().min(7, "El teléfono debe tener al menos 7 dígitos").optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>()
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)
  const { toast } = useToast()
  const [selectedTherapist, setSelectedTherapist] = useState<{ id: string; name: string } | null>(null);

  // Inicializar react-hook-form con el esquema de validación
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
    },
  })
  const { isSubmitting } = form.formState

  // Efecto para cargar horarios disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    setSelectedSlot(null);
    async function fetchSlots(date: Date) {
      const isoDate = format(date, "yyyy-MM-dd")
      try {
        const res = await fetch(`/api/availability?date=${isoDate}`)
        if (!res.ok) throw new Error("No se pudo obtener horarios disponibles")
        const data = await res.json()
        setAvailableSlots(data.slots || [])
      } catch (error) {
        console.error(error)
        toast({
          title: "Error al cargar horarios",
          description: "No pudimos obtener los horarios disponibles. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    }
    if (selectedDate?.from) fetchSlots(selectedDate.from)
    else setAvailableSlots([])
  }, [selectedDate, toast])

  const [therapists, setTherapists] = useState<any[]>([])

  useEffect(() => {
    async function fetchTherapists() {
      if (!selectedDate?.from || !selectedSlot) {
        setTherapists([])
        return
      }

      try {
        const isoDate = format(selectedDate.from, "yyyy-MM-dd")
        const res = await fetch(
          `/api/therapists?date=${isoDate}&hora_inicio=${selectedSlot.hora_inicio}&hora_fin=${selectedSlot.hora_fin}`
        )
        if (!res.ok) throw new Error("Error al cargar terapeutas")
        const data = await res.json()
        setTherapists(data.therapists || [])
      } catch (error) {
        console.error(error)
        toast({
          title: "Error al cargar terapeutas",
          description: "No pudimos obtener la lista de terapeutas.",
          variant: "destructive",
        })
      }
    }

    fetchTherapists()
  }, [selectedDate, selectedSlot, toast])


  function buildFechaISO(fecha: Date, hhmmss: string) {
    const [hh, mm, ss = "00"] = hhmmss.split(":");
    const dia = format(fecha, "yyyy-MM-dd");
    // Chile (America/Santiago) -03:00 la mayor parte del año; ajusta si manejas horario de verano
    return `${dia}T${hh}:${mm}:${ss}-03:00`;
  }

  // Envía la reserva al servidor
  const onSubmit = async (values: BookingFormData) => {
    if (!selectedDate?.from || !selectedSlot) {
      toast({
        title: "Selecciona fecha y horario",
        description: "Por favor elige una fecha y un horario antes de reservar.",
        variant: "destructive",
      })
      return
    }

    const selectedTherapist = therapists.find((t) => String(t.id) === values.therapist_id);

    const fechaISO = buildFechaISO(selectedDate.from, selectedSlot.hora_inicio);

    const payload = {
      therapist_id: form.getValues("therapist_id"),           // opcional
      terapeutaNombre: therapists.find(t => String(t.id) === form.getValues("therapist_id"))?.name, // opcional para el correo
      nombre: form.getValues("nombre"),
      email: form.getValues("email"),
      telefono: form.getValues("telefono"),
      fecha: format(selectedDate.from!, "yyyy-MM-dd"),
      hora_inicio: selectedSlot.hora_inicio,  // "HH:mm:ss"
      hora_fin: selectedSlot.hora_fin,
    }
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("El horario seleccionado ya no está disponible. Por favor elige otro.")
        }
      }
      toast({
        title: "Reserva confirmada",
        description: "Te enviaremos un correo para confirmar tu cita.",
      })
      form.reset()
      setSelectedSlot(null)
      // Eliminar el slot reservado de la lista local
      setAvailableSlots((prev) =>
        prev.filter(
          (slot) =>
            !(
              slot.hora_inicio === selectedSlot.hora_inicio &&
              slot.hora_fin === selectedSlot.hora_fin
            ),
        ),
      )
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al reservar",
        description: "Ocurrió un error al procesar tu reserva. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Agenda tu Cita</CardTitle>
        <CardDescription>
          Selecciona la fecha, el horario y completa tus datos para reservar una consulta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendario de selección de fecha */}
        <div className="flex flex-col items-start space-y-2">
          <p className="font-medium">Elige una fecha:</p>
          <Calendar
            selected={selectedDate?.from}
            onSelect={(date) => setSelectedDate({ from: date })}
            mode="single"
            required
          />
        </div>
        {/* Lista de horarios disponibles */}
        {selectedDate?.from && (
          <div className="space-y-2">
            <p className="font-medium">
              Horarios disponibles para {format(selectedDate.from, "dd/MM/yyyy")}:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={
                      selectedSlot && selectedSlot.id === slot.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.hora_inicio} - {slot.hora_fin}
                  </Button>
                ))
              ) : (
                <p>No hay horarios disponibles.</p>
              )}
            </div>
          </div>
        )}
        {/* Formulario de datos personales */}
        {selectedSlot && selectedDate?.from && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {therapists.length > 0 && (
                <FormField
                  control={form.control}
                  name="therapist_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecciona Terapeuta</FormLabel>
                      <FormControl>
                        <select {...field} className="border rounded p-2 w-full">
                          <option value="">-- Selecciona --</option>
                          {therapists.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombres y Apellidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ejemplo@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(+56) 9 XXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="font-medium">
                  Cita seleccionada: {selectedSlot.hora_inicio} - {selectedSlot.hora_fin} del {format(selectedDate.from, "dd/MM/yyyy")}
                </p>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="min-w-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  "Reservar cita"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

