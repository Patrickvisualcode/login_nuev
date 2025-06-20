import Link from "next/link"
import Image from "next/image"

export default function Principal() {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-section">
          <div className="qtec-logo">
            <div className="logo-icon">
              <Image src="/logo.png" alt="QTEC Logo" width={40} height={40} className="logo-image" />
            </div>
            <span className="logo-text">QTEC</span>
          </div>
        </div>

        <div className="header-buttons">
          <Link href="/login" className="btn-acceso">
            Acceso
          </Link>
          <Link href="/login" className="btn-empezar">
            Empezar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="content-wrapper">
          {/* Left Content */}
          <div className="text-content">
            <h1 className="main-title">
              "Impulsando el futuro de la Ciberseguridad con 
             Computación Cuántica
            </h1>

            <div className="subtitle-section">
              <p className="subtitle">Plataforma educativa para estudiantes de Tecsup</p>
              <p className="subtitle-highlight">
                — <span className="color-learn">Aprende</span>, <span className="color-simulate">simula</span> y{" "}
                <span className="color-protect">protege</span>.
              </p>
            </div>
          </div>

          {/* Right Content - Quantum Computing Image */}
          <div className="visual-content">
            <div className="quantum-image-container">
              <Image
                src="/computacion-cuantica.png"
                alt="Computación Cuántica"
                width={400}
                height={400}
                className="quantum-image"
                priority
              />
              {/* Decorative elements */}
              <div className="glow-effect"></div>
              <div className="floating-particles">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
