const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { OAuth2Client } = require("google-auth-library")
const nodemailer = require("nodemailer")
const axios = require("axios")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Cliente de Google OAuth
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/login",
)

// Configuración de nodemailer con Gmail MEJORADA
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Verificar configuración de email al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error en configuración de email:", error.message)
    console.log("💡 Verifica que EMAIL_USER y EMAIL_PASS estén correctos en .env")
    console.log("💡 EMAIL_PASS debe ser una contraseña de aplicación de Gmail")
  } else {
    console.log("✅ Servidor de email configurado correctamente")
  }
})

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
)
app.use(express.json())

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Cache para roles
const rolesCache = {}

// Cache para códigos de verificación temporales
const verificationCodes = new Map()

// Función para inicializar el cache de roles
async function initializeRolesCache() {
  try {
    const result = await pool.query('SELECT rol_id, nombre_rol FROM "Roles"')
    result.rows.forEach((role) => {
      rolesCache[role.nombre_rol] = role.rol_id
    })
    console.log("✅ Cache de roles inicializado:", rolesCache)
  } catch (error) {
    console.error("❌ Error inicializando cache de roles:", error)
  }
}

// Función para generar JWT
function generateJWT(user) {
  return jwt.sign(
    {
      userId: user.usuario_id,
      email: user.correo_electronico,
      role: user.nombre_rol,
      roleId: user.rol_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  )
}

// Función para generar código de verificación de 4 dígitos
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Función para enviar email de verificación MEJORADA
async function sendVerificationEmail(email, code, userName) {
  try {
    console.log(`📧 Enviando código ${code} a ${email}`)

    const mailOptions = {
      from: {
        name: "QTEC - Plataforma Educativa",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🔐 Código de Verificación - Activación Profesor QTEC",
      text: `Hola ${userName}, tu código de verificación para activar tu cuenta de profesor en QTEC es: ${code}. Este código expira en 10 minutos.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b9d 0%, #4c9aff 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px solid #4c9aff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #4c9aff; letter-spacing: 8px; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .instructions { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 QTEC</h1>
              <p>Activación de Cuenta Profesor</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Has solicitado activar tu cuenta como <strong>Profesor</strong> en QTEC.</p>
              <p>Tu código de verificación de 4 dígitos es:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="instructions">
                <p><strong>📋 Instrucciones:</strong></p>
                <ol>
                  <li>Copia este código: <strong>${code}</strong></li>
                  <li>Pégalo en la pantalla de verificación de QTEC</li>
                  <li>El código expira en <strong>10 minutos</strong></li>
                  <li>Si no solicitaste esta activación, ignora este email</li>
                </ol>
              </div>
              
              <p>Una vez verificado, tendrás acceso completo como profesor en la plataforma QTEC.</p>
              
              <p>¡Gracias por ser parte de QTEC! 🚀</p>
            </div>
            <div class="footer">
              <p>Este es un email automático, no responder.</p>
              <p>© 2024 QTEC - Tecsup. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Email enviado exitosamente:", info.messageId)
    console.log(`📧 Email enviado a: ${email}`)
    return true
  } catch (error) {
    console.error("❌ Error enviando email:", error.message)

    // Mostrar información específica del error
    if (error.code === "EAUTH") {
      console.log("💡 Error de autenticación Gmail:")
      console.log("   - Verifica que EMAIL_USER sea tu email completo")
      console.log("   - Verifica que EMAIL_PASS sea la contraseña de aplicación")
      console.log("   - Asegúrate de tener verificación en 2 pasos activada")
    }

    return false
  }
}

// RUTAS

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Servidor QTEC funcionando correctamente",
    timestamp: new Date().toISOString(),
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    emailConfigured: !!process.env.EMAIL_USER,
    emailUser: process.env.EMAIL_USER || "No configurado",
  })
})

// ENDPOINT: Autenticación con Google OAuth (sin popup)
app.post("/api/auth/google-oauth", async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    console.log("🔐 Iniciando proceso de autenticación OAuth...")

    const { code, redirectUri } = req.body

    if (!code) {
      console.log("❌ Código de autorización no proporcionado")
      return res.status(400).json({
        success: false,
        message: "Código de autorización requerido",
      })
    }

    // Paso 1: Intercambiar código por tokens
    console.log("🔄 Intercambiando código por tokens...")

    try {
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || "http://localhost:3000/login",
      })

      const { access_token, id_token } = tokenResponse.data
      console.log("✅ Tokens obtenidos exitosamente")

      // Paso 2: Verificar el ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      const { email, name } = payload
      console.log(`📧 Email obtenido: ${email}`)

      // Paso 3: Validar dominio institucional
      if (!email.endsWith("@tecsup.edu.pe")) {
        console.log(`❌ Dominio inválido: ${email}`)
        return res.status(403).json({
          success: false,
          message: "Acceso restringido. Solo se permiten cuentas de Tecsup (@tecsup.edu.pe).",
          requiresInstitutionalEmail: true,
        })
      }

      console.log(`✅ Usuario autenticado: ${email}`)

      // Paso 4: Buscar o crear usuario
      let userResult = await client.query(
        'SELECT u.*, r.nombre_rol FROM "Users" u JOIN "Roles" r ON u.rol_id = r.rol_id WHERE u.correo_electronico = $1',
        [email],
      )

      let user
      let isNewUser = false

      if (userResult.rows.length === 0) {
        // Usuario nuevo - asignar rol de Estudiante por defecto
        console.log("👤 Creando nuevo usuario...")
        const estudianteRolId = rolesCache["Estudiante"]

        if (!estudianteRolId) {
          throw new Error("Rol de Estudiante no encontrado en la base de datos")
        }

        const insertResult = await client.query(
          'INSERT INTO "Users" (nombre_completo, correo_electronico, rol_id) VALUES ($1, $2, $3) RETURNING *',
          [name, email, estudianteRolId],
        )

        // Obtener el usuario con el rol
        userResult = await client.query(
          'SELECT u.*, r.nombre_rol FROM "Users" u JOIN "Roles" r ON u.rol_id = r.rol_id WHERE u.usuario_id = $1',
          [insertResult.rows[0].usuario_id],
        )

        user = userResult.rows[0]
        isNewUser = true
        console.log("✅ Usuario creado exitosamente")
      } else {
        user = userResult.rows[0]
        console.log(`👤 Usuario existente encontrado: ${user.nombre_rol}`)
      }

      // Paso 5: Lógica de roles y redirección
      const roleName = user.nombre_rol

      if (roleName === "Administrador") {
        const token = generateJWT(user)
        await client.query("COMMIT")
        console.log("🔑 Acceso como Administrador")

        return res.json({
          success: true,
          message: "¡Acceso exitoso como Administrador!",
          token,
          user: {
            id: user.usuario_id,
            name: user.nombre_completo,
            email: user.correo_electronico,
            role: user.nombre_rol,
          },
          redirectTo: "/admin",
        })
      } else if (roleName === "Profesor") {
        const token = generateJWT(user)
        await client.query("COMMIT")
        console.log("🔑 Acceso como Profesor")

        return res.json({
          success: true,
          message: "¡Acceso exitoso como Profesor!",
          token,
          user: {
            id: user.usuario_id,
            name: user.nombre_completo,
            email: user.correo_electronico,
            role: user.nombre_rol,
          },
          redirectTo: "/profesor",
        })
      } else if (roleName === "Estudiante") {
        const token = generateJWT(user)
        await client.query("COMMIT")
        console.log("🔑 Acceso como Estudiante")

        return res.json({
          success: true,
          message: isNewUser ? "¡Bienvenido a QTEC!" : "¡Acceso exitoso!",
          token,
          user: {
            id: user.usuario_id,
            name: user.nombre_completo,
            email: user.correo_electronico,
            role: user.nombre_rol,
          },
          redirectTo: "/estudiante",
          canRequestProfessorActivation: true,
        })
      }
    } catch (tokenError) {
      console.error("❌ Error intercambiando tokens:", tokenError)
      throw new Error("Error en la autenticación con Google")
    }
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("❌ Error en autenticación OAuth:", error)

    res.status(500).json({
      success: false,
      message: "Error interno del servidor. Revisa la consola del backend.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  } finally {
    client.release()
  }
})

// ENDPOINT: Activación de profesor con código secreto y email REAL
app.post("/api/auth/activate-professor", async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const { userId, activationCode, verificationCode } = req.body

    if (!userId || !activationCode) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario y código de activación requeridos",
      })
    }

    // Si no hay código de verificación, generar y enviar uno
    if (!verificationCode) {
      // Buscar código de activación válido
      const codeResult = await client.query(
        `SELECT * FROM "ProfessorActivationCodes" 
         WHERE codigo_secreto = $1 
         AND estado = 'activo' 
         AND fecha_expiracion > NOW()
         AND usado_por_usuario_id IS NULL`,
        [activationCode],
      )

      if (codeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Código de activación inválido, expirado o ya usado",
        })
      }

      // Generar código de verificación de 4 dígitos
      const newVerificationCode = generateVerificationCode()

      // Obtener datos del usuario
      const userResult = await client.query(
        'SELECT correo_electronico, nombre_completo FROM "Users" WHERE usuario_id = $1',
        [userId],
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }

      const { correo_electronico: userEmail, nombre_completo: userName } = userResult.rows[0]

      // Guardar código de verificación temporalmente (expira en 10 minutos)
      verificationCodes.set(userId, {
        code: newVerificationCode,
        activationCode: activationCode,
        expires: Date.now() + 10 * 60 * 1000, // 10 minutos
      })

      // Enviar email con código de verificación REAL
      const emailSent = await sendVerificationEmail(userEmail, newVerificationCode, userName)

      if (!emailSent) {
        // Si falla el email, mostrar el código en consola como respaldo
        console.log(`🚨 CÓDIGO DE EMERGENCIA PARA ${userEmail}: ${newVerificationCode}`)
        console.log(`🚨 Usa este código si no llega el email: ${newVerificationCode}`)

        return res.json({
          success: true,
          message: "Código generado. Si no llega el email, revisa la consola del servidor.",
          requiresVerification: true,
          debugCode: process.env.NODE_ENV === "development" ? newVerificationCode : undefined,
        })
      }

      await client.query("COMMIT")

      return res.json({
        success: true,
        message: "Código de verificación enviado a tu correo institucional",
        requiresVerification: true,
      })
    }

    // Si hay código de verificación, validarlo
    const storedVerification = verificationCodes.get(userId)

    if (!storedVerification) {
      return res.status(400).json({
        success: false,
        message: "Código de verificación expirado. Solicita uno nuevo.",
      })
    }

    if (Date.now() > storedVerification.expires) {
      verificationCodes.delete(userId)
      return res.status(400).json({
        success: false,
        message: "Código de verificación expirado. Solicita uno nuevo.",
      })
    }

    if (storedVerification.code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Código de verificación incorrecto",
      })
    }

    // Código de verificación correcto, proceder con la activación
    const codeResult = await client.query(
      `SELECT * FROM "ProfessorActivationCodes" 
       WHERE codigo_secreto = $1 
       AND estado = 'activo' 
       AND fecha_expiracion > NOW()
       AND usado_por_usuario_id IS NULL`,
      [storedVerification.activationCode],
    )

    if (codeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Código de activación inválido, expirado o ya usado",
      })
    }

    const activationCodeData = codeResult.rows[0]
    const profesorRolId = rolesCache["Profesor"]

    // Actualizar usuario a rol de Profesor
    await client.query('UPDATE "Users" SET rol_id = $1 WHERE usuario_id = $2', [profesorRolId, userId])

    // Marcar código como usado
    await client.query(
      `UPDATE "ProfessorActivationCodes" 
       SET estado = 'usado', usado_por_usuario_id = $1, fecha_uso = NOW() 
       WHERE codigo_id = $2`,
      [userId, activationCodeData.codigo_id],
    )

    // Limpiar código de verificación
    verificationCodes.delete(userId)

    // Obtener usuario actualizado
    const userResult = await client.query(
      'SELECT u.*, r.nombre_rol FROM "Users" u JOIN "Roles" r ON u.rol_id = r.rol_id WHERE u.usuario_id = $1',
      [userId],
    )

    const user = userResult.rows[0]
    const token = generateJWT(user)

    await client.query("COMMIT")

    console.log(`✅ Usuario ${user.correo_electronico} activado como profesor exitosamente`)

    res.json({
      success: true,
      message: "¡Felicidades! Ahora eres profesor en QTEC",
      token,
      user: {
        id: user.usuario_id,
        name: user.nombre_completo,
        email: user.correo_electronico,
        role: user.nombre_rol,
      },
      redirectTo: "/profesor",
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("❌ Error en activación de profesor:", error)

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  } finally {
    client.release()
  }
})

// Resto de endpoints...
app.post("/api/auth/verify-token", (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    res.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId,
      },
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    })
  }
})

app.post("/api/auth/logout", (req, res) => {
  res.json({
    success: true,
    message: "Sesión cerrada exitosamente",
  })
})

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error("❌ Error no manejado:", error)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
})

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
})

// Inicializar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await pool.query("SELECT NOW()")
    console.log("✅ Conexión a la base de datos establecida")

    // Inicializar cache de roles
    await initializeRolesCache()

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor QTEC ejecutándose en puerto ${PORT}`)
      console.log(`📍 URL: http://localhost:${PORT}`)
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🔑 Google Client ID configurado: ${process.env.GOOGLE_CLIENT_ID}`)
      console.log(`📧 Email configurado: ${process.env.EMAIL_USER}`)
      console.log(`📧 Para configurar Gmail correctamente:`)
      console.log(`   1. Ve a myaccount.google.com`)
      console.log(`   2. Seguridad → Verificación en 2 pasos`)
      console.log(`   3. Contraseñas de aplicaciones → Generar`)
      console.log(`   4. Usa esa contraseña en EMAIL_PASS`)
    })
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error)
    console.log("💡 Verifica que PostgreSQL esté ejecutándose y la base de datos creada")
    process.exit(1)
  }
}

startServer()
