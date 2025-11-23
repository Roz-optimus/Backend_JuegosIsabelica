import { Router } from "express"
import { body, param } from "express-validator"
import { AuthController } from "../controllers/AuthController"
import { handleInputErrors } from "../middleware/validation"
import { limiter } from "../config/limiter"

const router = Router()

router.use(limiter)

// ✅ NUEVAS RUTAS GET
router.get('/pending-users', AuthController.getPendingUsers)
router.get('/all-users', AuthController.getAllUsers)
router.get('/user/:email', 
    param('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.getUserByEmail
)

// Rutas POST existentes
router.post('/create-account', 
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre no puede ir vacío')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña es muy corta, mínimo 8 caracteres'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email no puede ir vacío')
        .isEmail().withMessage('Correo no válido')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('El teléfono no puede ir vacío')
        .isMobilePhone('any', { strictMode: false }).withMessage('Número de teléfono inválido')
        .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres'),
    
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    limiter,
    body('token')
        .trim()
        .notEmpty().withMessage('El token no puede ir vacío')
        .isLength({ min: 6, max: 6 }).withMessage('Token inválido'),
    
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Email no válido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    handleInputErrors,
    AuthController.login
)

export default router
