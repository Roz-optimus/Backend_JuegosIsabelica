import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { generateJWT } from "../utils/jwt"


export class AuthController{
    static createAccount = async (req: Request, res: Response) =>{

       const {email, password, phone} = req.body
      
       const userExists = await User.findOne({where: {email}})
       if(userExists){
        const error = new Error('Ese correo ya esta registrado')
        return res.status(409).json({error:error.message})
       } 

       const phoneExists = await User.findOne({where: {phone} })
        if (phoneExists) {
            const error = new Error('Ese teléfono ya está registrado')
            return res.status(409).json({ error: error.message })
        }

       try {
         const user = new User(req.body)
         user.password = await hashPassword(password)
         user.token = generateToken()
         await user.save()

         res.json({
                message: 'Cuenta creada exitosamente',
                user: {
                    name: user.name, 
                    email: user.email,
                    phone: user.phone
                }
            })
       } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
        console.log(error)
       }
    }

    


    static confirmAccount = async (req: Request, res: Response) =>{
      const {token} = req.body

      const user = await User.findOne({where:{token}})
      if(!user){
        const error = new Error('token no valido')
        return res.status(401).json({error:error.message})
      }
      user.confirmed = true
      user.token = null
      await user.save()

      res.json("Cuenta Confirmada")
    }
      static login = async (req: Request, res: Response) => {
        
        const { email , password } = req.body

        
        const user = await User.findOne({where : {email}})
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return
        }
        if(!user.confirmed){
            const error = new Error('Usuario no ha sido confirmado')
            res.status(403).json({error: error.message})
            return
        }
        
        const isPasswordCorrect = await checkPassword(password, user.password)
         if(!isPasswordCorrect){
            const error = new Error('Password incorrecto')
            res.status(401).json({error: error.message})
            return
        } 
        const token = generateJWT(user.id)
        
    res.json(token)    
}
}