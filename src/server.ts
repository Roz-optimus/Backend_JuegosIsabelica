import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import AuthRouter from './routes/authRouter'    

async function connectDB(){
    try {
       await db.authenticate()
       await db.sync({ alter: true })
       db.sync()
       console.log(colors.blue.bold('Conexion existosa')) 
    } catch (error) {
        console.log(colors.red.bold("Conexion fallida"))
    }
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/auth', AuthRouter)

export default app