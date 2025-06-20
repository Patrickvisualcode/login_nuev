"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function RegisterCard() {
  const [notification, setNotification] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setNotification(null)

    try {
      // Simular proceso de Google Sign In
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Google Sign In iniciado")
      setNotification("Redirigiendo a Google para autenticación...")

      // Aquí implementarías la lógica real de Google OAuth
      // Por ejemplo: signIn('google') si usas NextAuth
    } catch (error) {
      setNotification("Error al conectar con Google. Por favor, intenta nuevamente.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNotification(null)

    try {
      // Validar que el correo sea institucional
      if (!formData.email.endsWith("@tecsup.edu.pe")) {
        setNotification(
          "Debes registrarte con tu correo institucional (@tecsup.edu.pe). Usa tu cuenta institucional o será inválido.",
        )
        setIsLoading(false)
        return
      }

      // Validar que la contraseña tenga al menos 6 caracteres
      if (formData.password.length < 6) {
        setNotification("La contraseña debe tener al menos 6 caracteres.")
        setIsLoading(false)
        return
      }

      // Simular proceso de registro
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Registro exitoso con:", formData.email)
      setNotification("¡Registro exitoso! Bienvenido a QTEC. Ahora puedes iniciar sesión.")

      // Limpiar formulario después del registro exitoso
      setTimeout(() => {
        setFormData({ email: "", password: "", rememberMe: false })
        setShowPassword(false)
        // Aquí podrías redirigir al login o dashboard
      }, 2000)
    } catch (error) {
      setNotification("Error al registrarse. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <div className="register-card">
      {/* Notification */}
      {notification && (
        <div className="notification-overlay">
          <div className="notification-card">
            <div className="notification-content">
              <div className="notification-icon">
                {notification.includes("exitoso") ? (
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
                    <path d="m15 9-6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m9 9 6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="notification-text">{notification}</p>
              <button onClick={closeNotification} className="notification-close">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register text in top right corner */}
      <div className="register-header">
        <span className="register-text">REGISTRO</span>
      </div>

      <div className="card-content">
        {/* Left side - Background Image */}
        <div className="image-section">
          <Image src="/regis.jpg" alt="Technology background" fill className="background-image" priority />
        </div>

        {/* Right side - Register Form */}
        <div className="form-section">
          {/* Header */}
          <div className="form-header">
            <div className="logo-container">
              <img src="/logo.png" alt="QTEC Logo" className="qtec-logo-image" />
              <span className="qtec-text">QTEC</span>
            </div>

            <p className="subtitle">Recuerda registrar tu cuenta institucional</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-fields">
              {/* Email Field */}
              <div className="form-field">
                <label htmlFor="email" className="field-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo institucional"
                  className="form-input"
                  required
                />
              </div>

              {/* Password Field with Eye Icon */}
              <div className="form-field">
                <label htmlFor="password" className="field-label">
                  Contraseña
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="form-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle-btn"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      // Eye Open Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="eye-icon">
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      // Eye Closed Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="eye-icon">
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1="1"
                          y1="1"
                          x2="23"
                          y2="23"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <label htmlFor="rememberMe" className="checkbox-label">
                  Recordarme
                </label>
              </div>
            </div>

            {/* Register Button */}
            <button type="submit" className={`register-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                "Ingresar"
              )}
            </button>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`google-button ${isGoogleLoading ? "loading" : ""}`}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
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
              )}
              <span>Ingresar con Google</span>
            </button>

            {/* Login Link */}
            <div className="login-link">
              <span>
                Ya tienes una cuenta?{" "}
                <Link href="/login" className="login-anchor">
                  Inicia sesión aquí
                </Link>
              </span>
            </div>
          </form>

          {/* Back to home link */}
          <div className="back-link">
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
