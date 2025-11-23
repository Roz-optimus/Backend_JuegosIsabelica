import app from './server'
import colors from 'colors'
import { connectDB } from './server'

const PORT = process.env.PORT || 4000

const startServer = async () => {
    try {
        await connectDB()
        
        app.listen(PORT, () => {
            console.log(colors.green.bold(`🚀 Servidor corriendo en puerto ${PORT}`))
            console.log(colors.cyan(`Ambiente: ${process.env.NODE_ENV || 'development'}`))
        })
    } catch (error) {
        console.error(colors.red.bold('❌ Error iniciando servidor:'), error)
        process.exit(1)
    }
}

startServer()
