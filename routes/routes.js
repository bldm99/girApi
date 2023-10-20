
import express from "express"
import { body } from "express-validator"


import { buscarRiesgos, r, registrarRiesgo, registroUsuario } from "../controllers/controllers.js"
import { ResultadoValidation } from "../middlewares/ResultadoValidation.js"

const router = express.Router()

router.post(
    "/registergir",
    [
        body('u_email' , 'Formato de email incorrecto')
            .trim()
            .isEmail()
            .normalizeEmail(),
        body('u_password', 'Formato de password incorrecto')
            .trim()
            .isLength({min:6})
    ],
    ResultadoValidation,
    registroUsuario
    
)

router.route("/registroriesgo").post(registrarRiesgo).get(buscarRiesgos) //agregar riesgos


export default router