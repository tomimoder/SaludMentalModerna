"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Check, X, Trash2, MessageSquare, Users, BarChart3, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Select component for choosing therapists when adding availability
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface Testimonial {
  id: number
  name: string
  email: string
  message: string
  rating: number
  approved: number
  created_at: string
}

interface Question {
  id: number
  question: string
  answer: string | null
  category: string
  frequency: number
  is_faq: number
  created_at: string
}
interface Answer {
  id: number
  question_id: number
  answer: string
  author_name: string
  author_email: string | null
  created_at: string
  is_approved: number
  question: string
}

interface Therapist {
  id: number
  name: string
}

interface Consulta {
  id: number
  nombre: string
  email: string
  telefono: string
  motivo_consulta: string
  fecha_creacion: string
  estado: "pendiente" | "contactado" | "agendado" | "completado"
  notas: string | null
  fecha_contacto: string | null
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [answers, setAnswers] = useState<Answer[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  // Estado para terapeutas, consultas de contacto y disponibilidad
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [newAvailability, setNewAvailability] = useState({
    therapistId: "",
    date: "",
    startTime: "",
    endTime: "",
  })
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null)
  const [notasText, setNotasText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [answerText, setAnswerText] = useState("")

  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!res.ok) throw new Error('Contraseña incorrecta')

      setIsAuthenticated(true)
      setLoginError("")
      fetchData()
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    setPassword("")
  }

  const fetchData = async () => {
    try {
      const [testimonialsRes, questionsRes, answersRes] = await Promise.all([
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/questions"),
        fetch('/api/admin/answers'),
      ])

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json()
        setTestimonials(testimonialsData)
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData)
      }

      if (answersRes.ok) {
        const answersData = await answersRes.json()
        setAnswers(answersData)
      }

      // Cargar terapeutas y consultas de contacto para las nuevas secciones del panel
      const [therapistsRes, consultasRes] = await Promise.all([
        fetch('/api/admin/therapists'),
        fetch('/api/admin/consultas'),
      ])
      if (therapistsRes.ok) {
        const therapistsData = await therapistsRes.json()
        setTherapists(therapistsData)
      }
      if (consultasRes.ok) {
        const consultasData = await consultasRes.json()
        setConsultas(consultasData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestimonialApproval = async (id: number, approved: boolean) => {
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      })

      if (response.ok) {
        setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, approved: approved ? 1 : 0 } : t)))
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
    }
  }

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este testimonio?")) return

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  const handleDeleteAnswer = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta respuesta?")) return

    try {
      const response = await fetch('/api/admin/answers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (response.ok) {
        alert('Respuesta eliminada correctamente')
        setAnswers((prev) => prev.filter((ans) => ans.id !== id))
      } else {
        alert('Error al eliminar la respuesta')
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('Error al eliminar la respuesta')
    }
  }

  // Maneja el envío de nueva disponibilidad de terapeutas
  const handleAddAvailability = async () => {
    const { therapistId, date, startTime, endTime } = newAvailability
    if (!therapistId || !date || !startTime || !endTime) return
    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapist_id: Number(therapistId),
          date,
          start_time: startTime,
          end_time: endTime,
        }),
      })
      if (response.ok) {
        alert('Disponibilidad agregada correctamente')
        setNewAvailability({ therapistId: '', date: '', startTime: '', endTime: '' })
      } else {
        alert('Error al agregar disponibilidad')
      }
    } catch (error) {
      console.error('Error adding availability:', error)
      alert('Error al agregar disponibilidad')
    }
  }

  // Maneja la respuesta a una consulta de contacto
const handleRespondConsulta = async () => {
  if (!selectedConsulta || !notasText.trim()) return
  try {
    const response = await fetch('/api/admin/consultas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedConsulta.id,
        notas: notasText,
        estado: 'contactado', // o 'agendado'/'completado' según el flujo
      }),
    })
    if (response.ok) {
      setConsultas((prev) =>
        prev.map((c) =>
          c.id === selectedConsulta.id
            ? { ...c, notas: notasText, estado: 'contactado', fecha_contacto: new Date().toISOString() }
            : c,
        ),
      )
      setSelectedConsulta(null)
      setNotasText('')
    } else {
      alert('Error al actualizar la consulta')
    }
  } catch (error) {
    console.error('Error responding consulta:', error)
    alert('Error al actualizar la consulta')
  }
}


  // Elimina una consulta de contacto
  const handleDeleteConsulta = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta consulta?')) return
    try {
      const response = await fetch('/api/admin/consultas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        setConsultas((prev) => prev.filter((c) => c.id !== id))
      } else {
        alert('Error al eliminar la consulta')
      }
    } catch (error) {
      console.error('Error deleting consulta:', error)
      alert('Error al eliminar la consulta')
    }
  }

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerText.trim()) return

    try {
      const response = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedQuestion.id,
          answer: answerText,
          is_faq: true,
        }),
      })

      if (response.ok) {
        setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? { ...q, answer: answerText, is_faq: 1 } : q)))
        setSelectedQuestion(null)
        setAnswerText("")
      }
    } catch (error) {
      console.error("Error answering question:", error)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) return

    try {
      const response = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setQuestions(questions.filter((q) => q.id !== id))
      }
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const stats = {
    totalTestimonials: testimonials.length,
    approvedTestimonials: testimonials.filter((t) => t.approved === 1).length,
    pendingTestimonials: testimonials.filter((t) => t.approved === 0).length,
    totalQuestions: questions.length,
    answeredQuestions: questions.filter((q) => q.answer).length,
    unansweredQuestions: questions.filter((q) => !q.answer).length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
            <p className="text-gray-600">Ingresa la contraseña para continuar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
              </div>
              <Button type="submit" className="w-full">
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona testimonios y preguntas frecuentes</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestimonials}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedTestimonials} aprobados, {stats.pendingTestimonials} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preguntas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.answeredQuestions} respondidas, {stats.unansweredQuestions} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ Activas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.filter((q) => q.is_faq === 1).length}</div>
            <p className="text-xs text-muted-foreground">Preguntas frecuentes publicadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="testimonials" className="space-y-6">
        <TabsList>
          <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
          <TabsTrigger value="questions">Preguntas</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials" className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.email}</p>
                    </div>
                    <div className="flex gap-1">{renderStars(testimonial.rating)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={testimonial.approved ? "default" : "secondary"}>
                      {testimonial.approved ? "Aprobado" : "Pendiente"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(testimonial.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.message}</p>

                <div className="flex gap-2">
                  {testimonial.approved === 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleTestimonialApproval(testimonial.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                  )}
                  {testimonial.approved === 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestimonialApproval(testimonial.id, false)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Desaprobar
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{question.question}</h3>
                    {question.answer && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-blue-900">{question.answer}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline">{question.category}</Badge>
                    <Badge variant="secondary">Freq: {question.frequency}</Badge>
                    {question.is_faq === 1 && <Badge className="bg-green-100 text-green-800">FAQ</Badge>}
                    <span className="text-sm text-gray-500">
                      {new Date(question.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedQuestion(question)
                          setAnswerText(question.answer || "")
                        }}
                      >
                        {question.answer ? "Editar respuesta" : "Responder"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Responder pregunta</DialogTitle>
                        <DialogDescription>{question.question}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Escribe la respuesta..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          rows={4}
                        />
                        <Button onClick={handleAnswerQuestion} className="w-full">
                          {question.answer ? "Actualizar respuesta" : "Publicar respuesta"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Sección para agregar disponibilidad de terapeutas */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Agregar Disponibilidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Selección de terapeuta */}
                <Select
                  onValueChange={(value) => setNewAvailability({ ...newAvailability, therapistId: value })}
                  value={newAvailability.therapistId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un terapeuta" />
                  </SelectTrigger>
                  <SelectContent>
                    {therapists.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Fecha de disponibilidad */}
                <Input
                  type="date"
                  value={newAvailability.date}
                  onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                />

                {/* Hora de inicio */}
                <Input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                />

                {/* Hora de fin */}
                <Input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                />
              </div>
              <Button onClick={handleAddAvailability}>Agregar Disponibilidad</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección para gestionar consultas del formulario de contacto */}
<TabsContent value="consultas" className="space-y-4">
  {consultas.length === 0 && (
    <p className="text-gray-600">No hay consultas pendientes.</p>
  )}
  {consultas.map((consulta) => (
    <Card key={consulta.id}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{consulta.nombre}</h3>
            <p className="text-sm text-gray-500 mb-1">
              {consulta.email} | {consulta.telefono}
            </p>
            <p className="mb-2 text-gray-700">{consulta.motivo_consulta}</p>
            <p className="text-xs text-gray-500">
              {new Date(consulta.fecha_creacion).toLocaleDateString("es-ES")}
            </p>

            {/* Mostrar notas si existen */}
            {consulta.notas && (
              <div className="mt-2 bg-green-50 p-3 rounded">
                <p className="text-sm text-green-800">
                  <strong>Notas:</strong> {consulta.notas}
                </p>
              </div>
            )}

            {/* Mostrar estado actual */}
            <Badge className="mt-2">{consulta.estado}</Badge>

            {/* Mostrar fecha de contacto si existe */}
            {consulta.fecha_contacto && (
              <p className="text-xs text-gray-400 mt-1">
                Contactado el:{" "}
                {new Date(consulta.fecha_contacto).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
            {consulta.estado === "pendiente" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedConsulta(consulta)
                      setNotasText(consulta.notas || "")
                    }}
                  >
                    Añadir notas / Contactar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gestionar consulta</DialogTitle>
                    <DialogDescription>{consulta.motivo_consulta}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Escribe las notas..."
                      value={notasText}
                      onChange={(e) => setNotasText(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleRespondConsulta} className="w-full">
                      Guardar y marcar como contactado
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteConsulta(consulta.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</TabsContent>

      </Tabs>
    </div>
  )
}
