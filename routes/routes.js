
import express from "express"
import { body } from "express-validator"


import { actualizarMriesgos, actualizarRalumnos, actualizarRalumnounico, actualizarRcausas, actualizarRconsecuencias, actualizarRcontroles, buscarCausas, buscarConsecuencias, buscarControles, buscarMacroprocesos, buscarMacroriesgos, buscarRiesgos, infoUser, loginUser, obtenerAlumnosDeRiesgo, r, recomendacionControl, refreshTokenx, registrarCausa, registrarConsecuencia, registrarControl, registrarMacroproceso, registrarRiesgo, registroUsuario } from "../controllers/controllers.js"
import { ResultadoValidation } from "../middlewares/ResultadoValidation.js"
import { requireToken } from "../utils/requireToken.js"
import { logout, verifyRefreshToken } from "../controllers/authcontroller.js"

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
    //mostrando errores de validaciones
    ResultadoValidation,
    //Funcion para registrar usuarios 
    registroUsuario
)
 
router.post(
    "/logingir",
    [
        body('u_email' , 'Formato de email incorrecto')
            .trim()
            .isEmail()
            .normalizeEmail(),
        body('u_password', 'Minimo 6 caracteres')
            .trim()
            .isLength({min:6})
    ],
    ResultadoValidation,
    loginUser
)

router.get('/logout',logout)

router.get('/protected' , requireToken ,infoUser)
router.get("/refresh" , refreshTokenx)
router.get('/verify-token', verifyRefreshToken);



router.route("/registroriesgo").post(registrarRiesgo).get(buscarRiesgos) //agregar riesgos
router.route("/registromacro").post(registrarMacroproceso).get(buscarMacroprocesos)
router.route("/pushmacro").post(actualizarMriesgos)  //pemite agregar mas riesgos al macroporcesos
router.route("/macroriesgo").get(buscarMacroriesgos) 

router.route("/causas").post(registrarCausa).get(buscarCausas)
router.route("/pushriesgocausa").post(actualizarRcausas)
router.route("/consecuencias").post(registrarConsecuencia).get(buscarConsecuencias)
router.route("/pushriesgoconsecuencia").post(actualizarRconsecuencias)
router.route("/controles").post(registrarControl).get(buscarControles)
router.route("/pushriesgocontrol").post(actualizarRcontroles)

router.route("/recomend").get(recomendacionControl)

router.route("/pushriesgoalumno").post(actualizarRalumnos)
router.route("/listalumno").post(actualizarRalumnounico)

router.route('/alumnos').get(obtenerAlumnosDeRiesgo);


export default router