
import express from "express";
import { Riesgo } from '../models/riesgos.js'



import bcryptjs from "bcryptjs"
import { generateToken } from "../utils/tokenManager.js";
import { validationResult } from "express-validator";

function valiarPassword(front, back) {
    return bcryptjs.compare(front, back)
}

export const registroUsuario = async (req, res) => {
    const { user, u_email, u_password, telefono, tarjeta, suscripcion } = req.body

    try {
        // Verificar si el correo electrónico ya está registrado
        const correoExistente = await Riesgo.findOne({ "u_email": u_email });
        if (correoExistente) {
            return res.status(400).json({ error: "El correo electrónico ya existe" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcryptjs.hash(u_password, 10);
        const tableriesgo = new Riesgo({
            user,
            u_email,
            u_password: hashedPassword,
            telefono,
            tarjeta,
            suscripcion

        })

        if (!tableriesgo) {
            res.status(500).json({ error: "No found" })
        }

        const savedClient = await tableriesgo.save();

        // _id del cliente registrado
        const clienteId = savedClient._id;
        const cliented_email = savedClient.u_email;

        // Generar token JWT utilizando el ID del cliente registrado
        const { token, expiresIn } = generateToken(clienteId, cliented_email);
        return res.status(200).json({ token, expiresIn });

    } catch (error) {
        console.log(error.code);
        console.log(error); // Muestra el objeto de error completo
        console.log(error.message); // Muestra el mensaje de error
        console.log(error.stack); // Muestra la pila de llamadas
    }

}

export const registrarRiesgo = async (req, res) => {
    //destructurando
    const { _id, nombre, impacto_desc, impacto_num, impacto_porc, probabilidad_desc, probabilidad_num,
        probabilidad_porc, calificacion, riesgo, proceso_asignado } = req.body;
    const tableriesgo = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'riesgos': {
                nombre,
                impacto_desc,
                impacto_num,
                impacto_porc,
                probabilidad_desc,
                probabilidad_num,
                probabilidad_porc,
                calificacion,
                riesgo,
                proceso_asignado
            }
        }
    })
    if (!tableriesgo) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tableriesgo);
}

//Buscar todos los riesgos de un solo usuario
export const buscarRiesgos = async (req, res) => {
    try {
        const { _id } = req.query; // Obtener el ID del usuario desde los parámetros de la URL

        const documento = await Riesgo.findById(_id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const riesgos = documento.riesgos;

        res.status(200).json(riesgos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar los riesgos' });
    }
};



/*----------------------------------Macroprocesos----------------------------*/

//Registrar Macroproceso y sus riesgos
export const registrarMacroproceso = async (req, res) => {
    //destructurando
    const { _id, m_nombre, m_tipo, m_descripcion, m_riesgos } = req.body;
    const tablemacro = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'macroprocesos': {
                m_nombre,
                m_tipo,
                m_descripcion,
                m_riesgos
            }
        }
    })
    
    if (!tablemacro) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tablemacro);
}


//Registrar un riesgo de un macroproceso
export const actualizarMriesgos = async (req, res) => {
    const { _idUsuario, _idMacroproceso, nuevosRiesgos } = req.body; // Usar _idUsuario y _idMacroproceso

    //Validamos si nuevosRiesgos tiene datos antes de hacer algun registro
    if (!nuevosRiesgos || nuevosRiesgos.length === 0) {
        return res.status(400).json({ error: 'La lista de nuevos riesgos está vacía o no se proporcionó.' });
    }
    try {
        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "macroprocesos._id": _idMacroproceso }, // Usar _idUsuario y _idMacroproceso
            { $push: { 'macroprocesos.$.m_riesgos': { $each: nuevosRiesgos } } }
        );


        if (resultado.modifiedCount > 0) {
            res.status(200).json({ message: 'Datos actualizados correctamente.' });
        } else {
            res.status(404).json({ error: 'No se encontró el documento para actualizar.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error en la actualización: ' + error.message });
    }
};





//Buscar todos los riesgos de un solo usuario
export const buscarMacroprocesos = async (req, res) => {
    try {
        const { _id } = req.query; // Obtener el ID del usuario desde los parámetros de la URL

        const documento = await Riesgo.findById(_id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const macroprocesos = documento.macroprocesos;

        res.status(200).json(macroprocesos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar los riesgos' });
    }
};









export const r = async (req, res) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        res.json({ ok: 'hhhhh' })
    } catch (error) {
        console.log(error.code);
    }
}