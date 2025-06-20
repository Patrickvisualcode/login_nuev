"use client"

import { useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ProfessorActivationFlowProps {
  user: User
  onSuccess: () => void
  onClose: () => void
}

type FlowStep = "enter-code" | "sending" | "verify-digits" | "success"

export default function ProfessorActivationFlow({ user, onSuccess, onClose }: ProfessorActivationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("enter-code")
  const [activationCode, setActivationCode] = useState("")
  const [verificationDigits, setVerificationDigits] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleActivationCodeSubmit = async () => {
    if (!activationCode.trim()) {
      setError("Por favor, ingresa el código de activación")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Llamar al backend para solicitar activación
      const response = await fetch("http://localhost:5000/api/auth/activate-professor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          activationCode: activationCode.trim(),
        }),
      })

      const data = await response.json()

      if (data.success && data.requiresVerification) {
        setCurrentStep("sending")
        // Simular envío de código
        setTimeout(() => {
          setCurrentStep("verify-digits")
          setIsLoading(false)
        }, 2000)
      } else {
        setError(data.message || "Error en la activación")
        setIsLoading(false)
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta nuevamente.")
      setIsLoading(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return // Solo un dígito

    const newDigits = [...verificationDigits]
    newDigits[index] = value

    setVerificationDigits(newDigits)

    // Auto-focus al siguiente input
    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerifyDigits = async () => {
    const code = verificationDigits.join("")
    if (code.length !== 4) {
      setError("Por favor, ingresa los 4 dígitos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Llamar al backend para activar profesor
      const response = await fetch("http://localhost:5000/api/auth/activate-professor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          activationCode: activationCode,
          verificationCode: code,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar localStorage con nueva información
        localStorage.setItem("qtec_token", data.token)
        localStorage.setItem("qtec_user", JSON.stringify(data.user))

        setCurrentStep("success")
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(data.message || "Error en la activación")
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "enter-code":
        return (
          <div className="professor-activation-content">
            <div className="form-header">
              <div className="logo-container">
                <img src="/logo.png" alt="QTEC Logo" className="qtec-logo-image" />
                <span className="qtec-text">QTEC</span>
              </div>
              <p className="subtitle">Ingresa tu código de activación docente</p>
            </div>

            <div className="activation-form">
              <div className="form-field">
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  placeholder="PROF2024001"
                  className="form-input"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    textAlign: "center",
                    marginBottom: "20px",
                    fontFamily: "monospace",
                    fontSize: "16px",
                  }}
                />
              </div>

              {error && (
                <div className="error-message" style={{ marginBottom: "20px", color: "#ef4444", fontSize: "14px" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleActivationCodeSubmit}
                disabled={isLoading}
                className="activation-button"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "46px",
                  background: "linear-gradient(135deg, #ff6b9d 0%, #4c9aff 100%)",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                {isLoading ? "Enviando..." : "Enviar Código Docente"}
              </button>

              <div className="register-link">
                <span>
                  No tienes una cuenta?{" "}
                  <a href="#" style={{ color: "#ef4444", fontWeight: "500" }}>
                    Regístrate aquí
                  </a>
                </span>
              </div>

              <div className="back-link" style={{ marginTop: "20px" }}>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )

      case "sending":
        return (
          <div className="professor-activation-content">
            <div className="form-header">
              <div className="logo-container">
                <img src="/logo.png" alt="QTEC Logo" className="qtec-logo-image" />
                <span className="qtec-text">QTEC</span>
              </div>
              <p className="subtitle">Enviando código de verificación</p>
            </div>

            <div className="sending-content" style={{ textAlign: "center" }}>
              <div className="form-field">
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="form-input"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    textAlign: "center",
                    marginBottom: "20px",
                    opacity: 0.7,
                  }}
                />
              </div>

              <button
                disabled
                className="activation-button"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "46px",
                  background: "linear-gradient(135deg, #ff6b9d 0%, #4c9aff 100%)",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  opacity: 0.7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <div className="loading-spinner"></div>
                Enviando...
              </button>

              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>Enviado a correo Docente.</p>

              <div className="register-link">
                <span>
                  No tienes una cuenta?{" "}
                  <a href="#" style={{ color: "#ef4444", fontWeight: "500" }}>
                    Regístrate aquí
                  </a>
                </span>
              </div>

              <div className="back-link" style={{ marginTop: "20px" }}>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )

      case "verify-digits":
        return (
          <div className="professor-activation-content">
            <div className="form-header">
              <div className="logo-container">
                <img src="/logo.png" alt="QTEC Logo" className="qtec-logo-image" />
                <span className="qtec-text">QTEC</span>
              </div>
              <p className="subtitle">Ingresa el código de verificación</p>
            </div>

            <div className="verification-content" style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "20px", fontSize: "14px", color: "#6b7280" }}>
                Ingrese el Código de 4 dígitos enviado a su correo Docente.
              </p>

              <div
                className="digits-container"
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                {verificationDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`digit-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    maxLength={1}
                    className="digit-input"
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "2px solid #d1d5db",
                      borderRadius: "50%",
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  />
                ))}
              </div>

              {error && (
                <div className="error-message" style={{ marginBottom: "20px", color: "#ef4444", fontSize: "14px" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyDigits}
                disabled={isLoading}
                className="activation-button"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "46px",
                  background: "linear-gradient(135deg, #ff6b9d 0%, #4c9aff 100%)",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Verificando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>

              <div className="register-link">
                <span>
                  No tienes una cuenta?{" "}
                  <a href="#" style={{ color: "#ef4444", fontWeight: "500" }}>
                    Regístrate aquí
                  </a>
                </span>
              </div>

              <div className="back-link" style={{ marginTop: "20px" }}>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="professor-activation-content">
            <div className="success-content" style={{ textAlign: "center", padding: "40px" }}>
              <div className="success-icon" style={{ marginBottom: "20px" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" />
                </svg>
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", color: "#10B981" }}>
                ¡Acceso exitoso! Bienvenido a QTEC.
              </h3>

              <button
                onClick={onSuccess}
                className="success-button"
                style={{
                  background: "linear-gradient(135deg, #ff6b9d 0%, #4c9aff 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="professor-activation-overlay">
      <div className="professor-activation-modal">
        <div className="professor-activation-card">
          <div className="login-header">
            <span className="login-text">ACTIVACIÓN DOCENTE</span>
          </div>

          <div className="card-content">
            <div className="form-section">{renderStep()}</div>

            <div className="image-section">
              <img
                src="/fot.png"
                alt="Technology background"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
