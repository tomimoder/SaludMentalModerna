"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, HelpCircle, Send, MessageCircle, User, Trash } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  frequency: number
}

interface Answer {
  id: number
  answer: string
  author_name: string
  author_email: string | null
  created_at: string
}

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: Answer[] }>({})
  const [newAnswer, setNewAnswer] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)

  useEffect(() => {
    fetchFAQs()
    generateSessionId()
  }, [])

  const generateSessionId = () => {
    if (!sessionStorage.getItem("faq_session_id")) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("faq_session_id", sessionId)
    }
  }

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/questions")
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
        // Fetch user answers for each FAQ
        data.forEach((faq: FAQ) => fetchUserAnswers(faq.id))
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserAnswers = async (questionId: number) => {
    try {
      const response = await fetch(`/api/questions/answers?questionId=${questionId}`)
      if (response.ok) {
        const answers = await response.json()
        setUserAnswers((prev) => ({ ...prev, [questionId]: answers }))
      }
    } catch (error) {
      console.error("Error fetching user answers:", error)
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setIsSubmitting(true)
    const sessionId = sessionStorage.getItem("faq_session_id")

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion,
          sessionId,
        }),
      })

      if (response.ok) {
        setNewQuestion("")
        alert("¡Gracias por tu pregunta! Será revisada y podría aparecer en las preguntas frecuentes.")
        fetchFAQs()
      } else {
        alert("Error al enviar la pregunta. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error submitting question:", error)
      alert("Error al enviar la pregunta. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswer.trim() || !authorName.trim() || !selectedFAQ) return

    setIsSubmittingAnswer(true)

    try {
      const response = await fetch("/api/questions/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedFAQ.id,
          answer: newAnswer,
          authorName,
          authorEmail: authorEmail || null,
        }),
      })

      if (response.ok) {
        setNewAnswer("")
        setAuthorName("")
        setAuthorEmail("")
        setSelectedFAQ(null)
        alert("¡Gracias por tu respuesta! Ha sido publicada.")
        // Refresh answers for this question
        fetchUserAnswers(selectedFAQ.id)
      } else {
        alert("Error al enviar la respuesta. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      alert("Error al enviar la respuesta. Inténtalo de nuevo.")
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  const handleDeleteAnswer = async (answerId: number, questionId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta respuesta?")) return

    try {
      const response = await fetch(`/api/questions/answers?answerId=${answerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Respuesta eliminada correctamente")
        fetchUserAnswers(questionId)
      } else {
        alert("Error al eliminar la respuesta")
      }
    } catch (error) {
      console.error("Error deleting answer:", error)
      alert("Error al eliminar la respuesta")
    }
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-blue-100 text-blue-800",
      terapia: "bg-green-100 text-green-800",
      citas: "bg-purple-100 text-purple-800",
      pagos: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-balance">Preguntas Frecuentes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar en preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    ¿No encuentras tu respuesta?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Hacer una pregunta</DialogTitle>
                    <DialogDescription>
                      Si no encuentras la respuesta que buscas, envíanos tu pregunta. Las más frecuentes aparecerán
                      aquí.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleQuestionSubmit} className="space-y-4">
                    <Input
                      placeholder="Escribe tu pregunta..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      required
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar pregunta"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${faq.id}`}
                  className="border rounded-lg px-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-pretty">{faq.question}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className={getCategoryColor(faq.category)}>
                          {faq.category}
                        </Badge>
                        {faq.frequency > 5 && (
                          <Badge variant="outline" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">Respuesta Oficial</Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-pretty bg-blue-50 p-3 rounded-lg">
                        {faq.answer}
                      </p>
                    </div>

                    {userAnswers[faq.id] && userAnswers[faq.id].length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Respuestas de la comunidad</span>
                        </div>
                        <div className="space-y-3">
                          {userAnswers[faq.id].map((answer) => (
                            <div key={answer.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-200">
                              <p className="text-gray-700 text-sm leading-relaxed mb-2">{answer.answer}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Por: {answer.author_name}</span>
                                <div className="flex items-center gap-2">
                                  <span>{new Date(answer.created_at).toLocaleDateString("es-ES")}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAnswer(answer.id, faq.id)}
                                    className="text-red-500 hover:text-red-700 h-6 px-2"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedFAQ(faq)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Agregar respuesta
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Agregar tu respuesta</DialogTitle>
                            <DialogDescription>
                              Comparte tu experiencia o conocimiento sobre esta pregunta
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleAnswerSubmit} className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Tu nombre</label>
                              <Input
                                placeholder="Nombre completo"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                required
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Email (opcional)</label>
                              <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={authorEmail}
                                onChange={(e) => setAuthorEmail(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Tu respuesta</label>
                              <Textarea
                                placeholder="Comparte tu experiencia o conocimiento..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                rows={4}
                                required
                              />
                            </div>

                            <Button type="submit" disabled={isSubmittingAnswer} className="w-full">
                              <Send className="w-4 h-4 mr-2" />
                              {isSubmittingAnswer ? "Enviando..." : "Enviar respuesta"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No se encontraron preguntas que coincidan con tu búsqueda."
                  : "Aún no hay preguntas frecuentes disponibles."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
