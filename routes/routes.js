
import express from "express"
import { body } from "express-validator"


import { actualizarMriesgos, actualizarRcausas, actualizarRconsecuencias, buscarCausas, buscarConsecuencias, buscarMacroprocesos, buscarMacroriesgos, buscarRiesgos, r, registrarCausa, registrarConsecuencia, registrarMacroproceso, registrarRiesgo, registroUsuario } from "../controllers/controllers.js"
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
router.route("/registromacro").post(registrarMacroproceso).get(buscarMacroprocesos)
router.route("/pushmacro").post(actualizarMriesgos)  //pemite agregar mas riesgos al macroporcesos
router.route("/macroriesgo").get(buscarMacroriesgos) 

router.route("/causas").post(registrarCausa).get(buscarCausas)
router.route("/pushriesgocausa").post(actualizarRcausas)
router.route("/consecuencias").post(registrarConsecuencia).get(buscarConsecuencias)
router.route("/pushriesgoconsecuencia").post(actualizarRconsecuencias)


export default router