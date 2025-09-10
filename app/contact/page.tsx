import { ContactForm } from "@/components/contact-form"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Salud Mental Moderna</h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contact Form Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Solicita tu Cita</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Completa el formulario y nos pondremos en contacto contigo para agendar tu primera consulta.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Contacto Directo</h3>
              <p className="text-muted-foreground mb-2">📧 ejemplo@mentalcare.com</p>
              <p className="text-muted-foreground">📞 (+56) 9 XXXX-XXXX</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Horarios de Atención</h3>
              <p className="text-muted-foreground mb-2">Lun - Vie: 9:00 AM - 7:00 PM (🔴DEFINIR HORARIOS CON JOSE LUIS)</p>
              <p className="text-muted-foreground">Sábado: 10:00 AM - 4:00 PM (🔴DEFINIR HORARIOS CON JOSE LUIS)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Ubicación</h3>
              <p className="text-muted-foreground">📍FALTA ALGUNA DIRECCION</p>
              <p className="text-muted-foreground text-sm mt-2">Consultas presenciales y online</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
