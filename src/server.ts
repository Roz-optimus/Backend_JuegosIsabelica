import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import { db } from './config/db'
import AuthRouter from './routes/authRouter'    

export async function connectDB() {
    try {
        await db.authenticate()
        console.log(colors.blue.bold('✅ Conexión a base de datos establecida')) 
        
        // IMPORTANTE: NO usar sync() en producción
        if (process.env.NODE_ENV !== 'production') {
            await db.sync({ alter: true })
            console.log(colors.cyan.bold('✅ Modelos sincronizados'))
        }
    } catch (error) {
        console.log(colors.red.bold("❌ Conexión fallida"))
        console.error(error)
        process.exit(1)
    }
}

const app = express()

// Middlewares de seguridad
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())

//Rutas
app.use('/api/auth', AuthRouter)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
