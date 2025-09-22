"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Heart, Users, Clock, Award, BookOpen, Target, CheckCircle, MessageCircle } from "lucide-react"
import Link from "next/link" // Added Link import for navigation
import { TestimonialsSection } from "../components/testimonials-section"
import { FAQSection } from "@/components/faq-section"


export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ["servicios", "metodologia", "antecedentes", "testimonios", "FAQ"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetBottom = offsetTop + element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScrollSpy)
    return () => window.removeEventListener("scroll", handleScrollSpy)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Salud Mental Moderna</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("servicios")}
              className={`px-4 py-2 rounded-md transition-all ${activeSection === "servicios"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-foreground hover:text-primary hover:bg-muted"
                }`}
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("metodologia")}
              className={`px-4 py-2 rounded-md transition-all ${activeSection === "metodologia"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-foreground hover:text-primary hover:bg-muted"
                }`}
            >
              Metodología
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className={`px-4 py-2 rounded-md transition-all ${activeSection === "testimonios"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-foreground hover:text-primary hover:bg-muted"
                }`}
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection("FAQ")}
              className={`px-4 py-2 rounded-md transition-all ${activeSection === "FAQ"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-foreground hover:text-primary hover:bg-muted"
                }`}
            >
              Preguntas Frecuentes
            </button>
            <button
              onClick={() => scrollToSection("antecedentes")}
              className={`px-4 py-2 rounded-md transition-all ${activeSection === "antecedentes"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-foreground hover:text-primary hover:bg-muted"
                }`}
            >
              Antecedentes
            </button>
            <Link href="/contact">
              <Button className="bg-accent hover:bg-accent/90">Contacto</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <img
          src="/images/brain-hero.png"
          alt="Cerebro futurista con conexiones neuronales"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0002})`,
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-6 text-balance">Salud Mental Moderna</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
            Trascendemos fronteras en la búsqueda incansable de una salud mental integral y duradera. Fusionamos la
            ciencia de vanguardia con la calidez humana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
              onClick={() => scrollToSection("servicios")}
            >
              Conocer Servicios
            </Button>
            <Link href="/agenda">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                Agendar Consulta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-card-foreground mb-8">Nuestra Misión</h3>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Unimos neurociencia, psicoterapia y un enfoque personalizado que coloca a cada individuo en el centro de
              su proceso de cambio. Con pasión, precisión y compromiso, iluminamos el camino hacia una vida plena,
              equilibrada y consciente, superando límites y redefiniendo lo posible en el cuidado de la mente y el
              espíritu.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Nuestros Servicios</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Terapia Individual</CardTitle>
                <CardDescription>Sesiones personalizadas de 60-90 minutos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tratamiento individualizado basado en CBT y terapias de tercera generación, adaptado a las necesidades
                  específicas de cada paciente.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Terapia Grupal</CardTitle>
                <CardDescription>Sesiones grupales y familiares</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intervenciones grupales y familiares para fortalecer redes de apoyo y desarrollar habilidades sociales
                  e interpersonales.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Neuropsicología</CardTitle>
                <CardDescription>Evaluación y rehabilitación cognitiva</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evaluación neuropsicológica especializada y programas de rehabilitación cognitiva basados en evidencia
                  científica.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Psicoterapia Breve</CardTitle>
                <CardDescription>Objetivos específicos en 8-12 sesiones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intervenciones focalizadas con técnicas específicas para resolver problemáticas concretas en un tiempo
                  determinado.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Talleres Psicoeducativos</CardTitle>
                <CardDescription>Educación y prevención en salud mental</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Talleres sobre manejo del estrés, regulación emocional, habilidades sociales y prevención del consumo
                  de sustancias.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Intervención en Crisis</CardTitle>
                <CardDescription>Atención inmediata especializada</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evaluación de riesgo suicida y técnicas de grounding para situaciones de crisis que requieren atención
                  inmediata.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Treatment Plan Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-card-foreground mb-12">
              Plan de Tratamiento Integrativo
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  12
                </div>
                <h4 className="text-xl font-semibold mb-2">Meses de Duración</h4>
                <p className="text-muted-foreground">Tratamiento integral y sostenible</p>
              </div>
              <div className="text-center">
                <div className="bg-accent text-accent-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-2">Sesión Semanal</h4>
                <p className="text-muted-foreground">Presencial u online</p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  60-90
                </div>
                <h4 className="text-xl font-semibold mb-2">Minutos por Sesión</h4>
                <p className="text-muted-foreground">Tiempo personalizado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="metodologia" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Metodología Integrativa</h3>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-semibold mb-6 text-primary">Enfoques Terapéuticos</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold">Terapia Cognitivo-Conductual (CBT)</h5>
                    <p className="text-muted-foreground">
                      Reestructuración cognitiva, activación conductual y resolución de problemas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold">Terapias de Tercera Generación</h5>
                    <p className="text-muted-foreground">
                      DBT, ACT y Mindfulness para regulación emocional y aceptación
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold">Neurociencia Aplicada</h5>
                    <p className="text-muted-foreground">
                      Integración de conocimientos neurocientíficos en el tratamiento
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold">Enfoque Personalizado</h5>
                    <p className="text-muted-foreground">Adaptación del tratamiento a las necesidades individuales</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-lg">
              <h4 className="text-2xl font-semibold mb-6 text-primary">Proceso de Evaluación</h4>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold">Entrevista Inicial</h5>
                    <p className="text-sm text-muted-foreground">Establecimiento de alianza terapéutica</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold">Evaluación Psicológica</h5>
                    <p className="text-sm text-muted-foreground">Instrumentos validados (BAI, BDI-II, GAD-7)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold">Formulación del Caso</h5>
                    <p className="text-sm text-muted-foreground">Hipótesis clínica personalizada</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold">Plan de Tratamiento</h5>
                    <p className="text-sm text-muted-foreground">Objetivos específicos y medibles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20">
        <TestimonialsSection />
      </section>

      {/* FAQ Section */}
      <section id="FAQ" className="py-20">
        <FAQSection />
      </section>

      {/* Professional Background */}
      <section id="antecedentes" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-card-foreground mb-12">
            Antecedentes Profesionales
          </h3>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h4 className="text-2xl font-semibold text-primary mb-4">José Luis Arturo Moder Figueroa</h4>
              <p className="text-lg text-muted-foreground mb-4">Psicólogo Clínico-Comunitario</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Formación Académica</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold">Título de Psicólogo</h5>
                    <p className="text-sm text-muted-foreground">Universidad de las Américas (2021)</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Licenciado en Psicología</h5>
                    <p className="text-sm text-muted-foreground">Universidad de las Américas (2021)</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Práctica Profesional</h5>
                    <p className="text-sm text-muted-foreground">CAPS UDLA Maipú (2020-2021)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <span>Especialización</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold">Neuropsicología Clínica</h5>
                    <p className="text-sm text-muted-foreground">Neuroclass.com (2024)</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Salud Mental Interdisciplinaria</h5>
                    <p className="text-sm text-muted-foreground">Universidad de las Américas (2021)</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Mindfulness Terapéutico</h5>
                    <p className="text-sm text-muted-foreground">Certificación ADIPA (2023)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12">
              <h4 className="text-xl font-semibold text-center mb-8">Diplomados y Certificaciones</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Badge variant="outline" className="p-3 text-center">
                  Salud Pública y Sistemas de Salud - USACH
                </Badge>
                <Badge variant="outline" className="p-3 text-center">
                  Psicología Social y Comunitaria - USACH
                </Badge>
                <Badge variant="outline" className="p-3 text-center">
                  Neuropsicología - USACH
                </Badge>
                <Badge variant="outline" className="p-3 text-center">
                  Salud Familiar en Atención Primaria - USACH
                </Badge>
                <Badge variant="outline" className="p-3 text-center">
                  Cuidados Paliativos - OPS
                </Badge>
                <Badge variant="outline" className="p-3 text-center">
                  Prevención de Drogas - SENDA
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Comienza tu Proceso de Transformación</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Cada paso que damos es una apuesta por el bienestar, el crecimiento y la transformación que mereces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agenda">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3">
                Agendar Consulta
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                Más Información
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6" />
                <h4 className="text-xl font-semibold">Salud Mental Moderna</h4>
              </div>
              <p className="text-primary-foreground/80">
                Fusionando ciencia de vanguardia con calidez humana para tu bienestar integral.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Servicios</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Terapia Individual</li>
                <li>Terapia Grupal</li>
                <li>Neuropsicología</li>
                <li>Psicoterapia Breve</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contacto</h5>
              <div className="space-y-2 text-primary-foreground/80">
                <p>Modalidad presencial y online</p>
                <p>Área Clínica-Comunitaria</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2025 Salud Mental Moderna. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="https://wa.me/56987146115" //CAMBIAR POR EL NUMERO DE WHATSAPP DE LA CLINICA
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </Link>
      </div>

    </div>
  )
}
