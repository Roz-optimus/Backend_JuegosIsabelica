import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";

const router =  Router()

router.use(limiter)

router.post('/create-account', 
    body('name').notEmpty().withMessage('el nombre no puede ir vacio'),
    body('password').isLength({min: 8}).withMessage('La contraseña es muy corta, minimo 8 caracteres'),
    body('email').isEmail().withMessage('correo no valido'),
    body('phone').trim().notEmpty().withMessage('El telefono no puede ir vacio').isMobilePhone('any', {strictMode:false}).withMessage('Numero de telefono invalido').isLength({min: 7, max: 20}).withMessage('El telefono deber tener entre 7 y 20 caracteres'),

    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    limiter,
    body('token').notEmpty().withMessage('el token no puede ir vacio').isLength({min:6, max:6}),
    handleInputErrors,
    AuthController.confirmAccount,
)

router.post('/login',
    body('email').isEmail().withMessage('Email no valido'),
    body('password').notEmpty().withMessage('la contraseña es obligatoria'),
    handleInputErrors,
    AuthController.login
)


export default router