"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import ProfessorActivationFlow from "./professor-activation-flow"

export default function LoginCard() {
  const [notification, setNotification] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfessorActivation, setShowProfessorActivation] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Verificar si hay un código de autorización en la URL al cargar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const error = urlParams.get("error")

    if (error) {
      setNotification("Error en la autenticación con Google. Por favor, intenta nuevamente.")
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (code) {
      handleAuthorizationCode(code)
    }
  }, [])

  const handleAuthorizationCode = async (code: string) => {
    setIsLoading(true)
    console.log("Procesando código de autorización:", code)

    try {
      // Enviar el código al backend
      const response = await fetch("http://localhost:5000/api/auth/google-oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          redirectUri: window.location.origin + "/login",
        }),
      })

      const data = await response.json()
      console.log("Respuesta del backend:", data)

      if (data.success) {
        // Guardar token en localStorage
        localStorage.setItem("qtec_token", data.token)
        localStorage.setItem("qtec_user", JSON.stringify(data.user))

        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname)

        // Si es estudiante y puede solicitar activación de profesor, mostrar opción
        if (data.user.role === "Estudiante" && data.canRequestProfessorActivation) {
          setCurrentUser(data.user)
          setNotification(
            `${data.message} ¿Eres profesor? Puedes activar tu cuenta de profesor con un código de activación.`,
          )
        } else {
          setNotification(data.message)
          // Redirigir según el rol después de 2 segundos
          setTimeout(() => {
            switch (data.user.role) {
              case "Administrador":
                window.location.href = "/admin"
                break
              case "Profesor":
                window.location.href = "/profesor"
                break
              case "Estudiante":
                window.location.href = "/estudiante"
                break
              default:
                window.location.href = "/dashboard"
            }
          }, 2000)
        }
      } else {
        setNotification(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error procesando código de autorización:", error)
      setNotification("Error de conexión. Asegúrate de que el backend esté ejecutándose.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setNotification(null)

    try {
      // Configuración OAuth sin popup
      const clientId = "111186496772-u2hd0kb1a5j15higisrcsnjsqi1odpev.apps.googleusercontent.com"
      const redirectUri = encodeURIComponent(window.location.origin + "/login")
      const scope = encodeURIComponent("openid email profile")
      const responseType = "code"
      const accessType = "offline"
      const prompt = "select_account"

      // Construir URL de autorización
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `access_type=${accessType}&` +
        `prompt=${prompt}`

      console.log("Redirigiendo a Google OAuth:", authUrl)

      // Redirigir a Google OAuth (sin popup)
      window.location.href = authUrl
    } catch (error) {
      console.error("Error en Google Sign-In:", error)
      setNotification("Error al inicializar Google Sign-In. Por favor, recarga la página.")
      setIsLoading(false)
    }
  }

  const handleActivateAsProfesor = () => {
    setShowProfessorActivation(true)
    setNotification(null)
  }

  const handleContinueAsStudent = () => {
    if (currentUser) {
      setTimeout(() => {
        window.location.href = "/estudiante"
      }, 1000)
    }
  }

  const closeNotification = () => {
    setNotification(null)
  }

  const handleProfessorActivationSuccess = () => {
    setShowProfessorActivation(false)
    setNotification("¡Felicidades! Ahora eres profesor en QTEC.")
    setTimeout(() => {
      window.location.href = "/profesor"
    }, 2000)
  }

  const handleProfessorActivationClose = () => {
    setShowProfessorActivation(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Notification */}
        {notification && !showProfessorActivation && (
          <div className="notification-overlay">
            <div className="notification-card">
              <div className="notification-content">
                <div className="notification-icon">
                  {notification.includes("exitoso") || notification.includes("Bienvenido") ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
                      <path
                        d="m15 9-6 6"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="m9 9 6 6" stroke="#EF4444" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="notification-text">{notification}</p>

                {/* Si es estudiante con opción de activar como profesor */}
                {currentUser && currentUser.role === "Estudiante" && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleActivateAsProfesor} className="notification-close">
                      Activar como Profesor
                    </button>
                    <button
                      onClick={handleContinueAsStudent}
                      className="notification-close"
                      style={{ background: "#6b7280" }}
                    >
                      Continuar como Estudiante
                    </button>
                  </div>
                )}

                {/* Botón normal para otros casos */}
                {!(currentUser && currentUser.role === "Estudiante") && (
                  <button onClick={closeNotification} className="notification-close">
                    Entendido
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login text in top left corner */}
        <div className="login-header">
          <span className="login-text">INICIA SESION</span>
        </div>

        <div className="card-content">
          {/* Left side - Login Form */}
          <div className="form-section">
            {/* Header */}
            <div className="form-header">
              <div className="logo-container">
                <img src="/logo.png" alt="QTEC Logo" className="qtec-logo-image" />
                <span className="qtec-text">QTEC</span>
              </div>

              <p className="subtitle">Recuerda hacer uso de tu cuenta institucional</p>
            </div>

            {/* Form Buttons */}
            <div className="form-buttons">
              {/* Google Sign In Button */}
              <button
                className={`google-button ${isLoading ? "loading" : ""}`}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Redirigiendo a Google...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              {/* Ingresar Button */}
              <button className="ingresar-button">Ingresar</button>

              {/* Register Link */}
              <div className="register-link">
                <span>
                  No tienes una cuenta?{" "}
                  <Link href="/register" className="register-anchor">
                    Regístrate aquí
                  </Link>
                </span>
              </div>
            </div>

            {/* Back to home link */}
            <div className="back-link">
              <Link href="/" className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* Right side - Background Image */}
          <div className="image-section">
            <Image src="/fot.png" alt="Technology background" fill className="background-image" priority />
          </div>
        </div>
      </div>

      {/* Professor Activation Flow */}
      {showProfessorActivation && (
        <ProfessorActivationFlow
          user={currentUser}
          onSuccess={handleProfessorActivationSuccess}
          onClose={handleProfessorActivationClose}
        />
      )}
    </div>
  )
}
