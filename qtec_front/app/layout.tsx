import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QTEC - Plataforma Educativa",
  description:
    "Impulsando el futuro de la Ciberseguridad con Computación Cuántica - Plataforma educativa para estudiantes de Tecsup",
  keywords: "QTEC, Ciberseguridad, Computación Cuántica, Tecsup, Educación, Tecnología",
  authors: [{ name: "QTEC Team" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
