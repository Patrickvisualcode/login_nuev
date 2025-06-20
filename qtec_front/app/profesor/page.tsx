"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ProfesorPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("qtec_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("qtec_token")
    localStorage.removeItem("qtec_user")
    window.location.href = "/login"
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Profesor</h1>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">¡Bienvenido Profesor!</h2>
            <p className="text-purple-700">
              <strong>Nombre:</strong> {user.name}
            </p>
            <p className="text-purple-700">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-purple-700">
              <strong>Rol:</strong> {user.role}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Acceso Autorizado</h3>
              <p className="text-green-700">Tienes acceso completo como profesor del sistema QTEC.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📚 Panel de Profesor</h3>
              <p className="text-blue-700">Gestiona tus cursos, estudiantes y contenido académico.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
