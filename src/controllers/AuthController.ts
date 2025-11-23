import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        const { email, password, phone } = req.body
       
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            const error = new Error('Ese correo ya está registrado')
            return res.status(409).json({ error: error.message })
        }

        const phoneExists = await User.findOne({ where: { phone } })
        if (phoneExists) {
            const error = new Error('Ese teléfono ya está registrado')
            return res.status(409).json({ error: error.message })
        }

        try {
            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.token = generateToken()
            await user.save()
            
            // DEVOLVER EL TOKEN EN LA RESPUESTA
            res.json({
                message: 'Cuenta creada exitosamente',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                confirmationToken: user.token  
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

      static getPendingUsers = async (req: Request, res: Response) => {
        try {
            const pendingUsers = await User.findAll({
                where: {
                    confirmed: false
                },
                attributes: ['id', 'name', 'email', 'phone', 'token', 'createdAt'],
                order: [['createdAt', 'DESC']]  // Más recientes primero
            })

            res.json({
                message: 'Usuarios pendientes de confirmación',
                count: pendingUsers.length,
                users: pendingUsers.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    confirmationToken: user.token,
                    createdAt: user.createdAt
                }))
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error al obtener usuarios' })
        }
      }

       // ✅ NUEVO: Obtener todos los usuarios (confirmados y pendientes)
    static getAllUsers = async (req: Request, res: Response) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'name', 'email', 'phone', 'confirmed', 'token', 'createdAt'],
                order: [['createdAt', 'DESC']]
            })

            res.json({
                message: 'Lista de todos los usuarios',
                count: users.length,
                users: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    confirmed: user.confirmed,
                    confirmationToken: user.confirmed ? null : user.token,  // Solo mostrar token si no está confirmado
                    createdAt: user.createdAt
                }))
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error al obtener usuarios' })
        }
    }

    // ✅ NUEVO: Obtener un usuario específico por email

    static getUserByEmail = async (req: Request, res: Response) => {
        const { email } = req.params

        try {
            const user = await User.findOne({
                where: { email },
                attributes: ['id', 'name', 'email', 'phone', 'confirmed', 'token', 'createdAt']
            })

            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' })
            }

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    confirmed: user.confirmed,
                    confirmationToken: user.confirmed ? null : user.token,
                    createdAt: user.createdAt
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error al obtener usuario' })
        }
    }




    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token no válido')
            return res.status(401).json({ error: error.message })
        }
        
        user.confirmed = true
        user.token = null
        await user.save()

        res.json({
            message: "Cuenta confirmada exitosamente",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                confirmed: user.confirmed
            }
        })
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }
        
        if (!user.confirmed) {
            const error = new Error('Usuario no ha sido confirmado')
            res.status(403).json({ error: error.message })
            return
        }
        
        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            res.status(401).json({ error: error.message })
            return
        }
        
        const token = generateJWT(user.id)
        
        res.json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })    
    }
}
