"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, Send } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Testimonial {
  id: number
  name: string
  message: string
  rating: number
  created_at: string
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: "", email: "", message: "", rating: 5 })
        alert("¡Gracias por tu testimonio! Será revisado antes de publicarse.")
      } else {
        alert("Error al enviar el testimonio. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error)
      alert("Error al enviar el testimonio. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
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
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-balance">Lo que dicen nuestros pacientes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Testimonios reales de personas que han encontrado apoyo y bienestar en nuestros servicios
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="mb-12">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Verificado
                          </Badge>
                          <div className="flex gap-1">{renderStars(testimonial.rating)}</div>
                        </div>

                        <Quote className="w-8 h-8 text-blue-500 mb-4" />

                        <p className="text-gray-700 mb-4 text-pretty leading-relaxed">{testimonial.message}</p>

                        <div className="border-t pt-4">
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(testimonial.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        ) : (
          <div className="text-center mb-12">
            <p className="text-gray-600">Sé el primero en compartir tu experiencia</p>
          </div>
        )}

        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Compartir mi experiencia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Comparte tu testimonio</DialogTitle>
                <DialogDescription>
                  Tu experiencia puede ayudar a otras personas. Todos los testimonios son revisados antes de publicarse.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  type="email"
                  placeholder="Tu email (no será publicado)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Textarea
                  placeholder="Comparte tu experiencia..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Calificación:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${i < formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Enviando..." : "Enviar testimonio"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  )
}
