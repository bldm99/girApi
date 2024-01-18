
import express from "express";
import jwt from "jsonwebtoken";
import { Riesgo } from '../models/riesgos.js'



import bcryptjs from "bcryptjs"
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";
import { validationResult } from "express-validator";

function valiarPassword(front, back) {
    return bcryptjs.compare(front, back)
}


// Datos generales para recomendacion
export const recomendacionControl = async (req, res) => {
    try {
        // Consultar todos los documentos de la colección
        const documentos = await Riesgo.find();

        // Verificar si hay documentos
        if (!documentos || documentos.length === 0) {
            return res.status(404).json({ error: 'No se encontraron documentos' });
        }

        // Crear un array para almacenar todos los riesgos de todos los documentos
        let riesgos = [];

        // Iterar sobre cada documento y extraer los riesgos
        documentos.forEach(documento => {
            riesgos = riesgos.concat(documento.riesgos);
        });

        res.status(200).json(riesgos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar los riesgos' });
    }
};




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

        //Obtenemos el _id y el email del cliente registrado
        const clienteId = savedClient._id;
        const cliented_email = savedClient.u_email;

        // Generar token JWT utilizando el ID y email del cliente registrado
        const { token, expiresIn } = generateToken(clienteId, cliented_email)
        //Nesesaria para genera un refresh token que se usara para crear una cookie
        //llamada refreshToken
        generateRefreshToken(clienteId, cliented_email, res)
        return res.status(201).json({ token, expiresIn });

    } catch (error) {
        console.log(error.code);
        console.log(error); // Muestra el objeto de error completo
        console.log(error.message); // Muestra el mensaje de error
        console.log(error.stack); // Muestra la pila de llamadas
    }
}


export const loginUser = async (req, res) => {
    try {
        // Destructurando
        const { u_email, u_password } = req.body;

        // Verificar si el correo electrónico existe
        let user = await Riesgo.findOne({ u_email });
        if (!user) {
            return res.status(403).json({ error: "No existe el usuario" });
        }

        //Validamos 
        const validacion = await user.comparePassword(u_password)
        if (!validacion) {
            return res.status(403).json({ error: "Contraseña incorrecta" });
        }
        /*const validacionp = await valiarPassword(d_password, user.d_password)
        if (!validacionp) {
            return res.status(403).json({ error: "Contraseña incorrecta" });
        }*/

        //generar token JWT
        const { token, expiresIn } = generateToken(user._id, user.u_email)
        //Nesesaria para genera un refresh token que se usara para crear una cookie
        //llamada refreshToken
        generateRefreshToken(user._id, user.u_email, res)
        //Cookie
        /*res.cookie("token", token , {
            //la cookie solo viviera en el http y no podra ser accedidp po js en frontend
            httpOnly: true ,
            //
            secure: !(process.env.MODO === "developer"),

        })*/
        return res.json({ token, expiresIn })
        //return res.json({ ok: 'Login' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error del servidor" });
    }
}

export const infoUser = async (req, res) => {
    try {
        const user = await Riesgo.findById(req.uid).lean()
        return res.json({ email: user.u_email, uid: user._id })

    } catch (error) {
        return res.status(500).json({ error: 'Error de server' })
    }
}


//Cada vez que se haga uso de esta funcion a taves de sus ruta y el usurio tengas
//el refreshtoken le devolveremos un token valido
export const refreshTokenx = async (req, res) => {
    try {
        //busca una cookie en el navegador fronend ,la cookie refresh dura 30 dias aprox
        const refreshTokenCookie = req.cookies.refreshToken

        //Verificamos si existe ese refreshToken en la cookie del usuario
        if (!refreshTokenCookie) throw new Error('No existe el token')

        //si el refreshToken existe a trves del payload le sacamos el id y el em
        const { uid, em } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH)

        //como ya tendriamos el id y el em de refreshToken generamos un nuevo token de seguridad
        //valido , este nuevo token sera otro diferente pero valido y real
        const { token, expiresIn } = generateToken(uid, em)
        //Ese token de seguridad lo devolvemos a la vista como petivion
        return res.json({ token, expiresIn })

    } catch (error) {
        console.log(error.message)

        const TokenVerificationErrors = {
            "invalid signature": "La firma de JWT no es valida",
            "jwt expired": "JWT expirado",
            "invalid token": "Token no valido",
            "No Bearer": "Utiliza formato Bearer",
            "jwt malformed": "JWT formato no valido"
        }
        return res
            .status(401)
            .send({ error: TokenVerificationErrors[error.message] })
    }
}



//-------------------------Riesgos------------------------------------
export const registrarRiesgo = async (req, res) => {
    //destructurando
    const { _id, nombre, impacto_desc, impacto_num, impacto_porc, probabilidad_desc, probabilidad_num,
        probabilidad_porc, calificacion, riesgo, proceso_asignado, r_causas, r_consecuencias, r_controles } = req.body;
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
                proceso_asignado,
                r_causas,
                r_consecuencias,
                r_controles
            }
        }
    })
    if (!tableriesgo) {
        res.status(500).json({ error: "No al registrar" })
    }

    const riesgoAgregado = await Riesgo.findOne(
        { _id: _id },
        { riesgos: { $slice: -1 } } // Obtener el último elemento del array de riesgos
    );



    //res.status(200).json(tableriesgo);
    res.status(200).json(riesgoAgregado.riesgos[0]._id);
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

export const actualizarRiesgo = async (req, res) => {
    // Destructurando los datos del cuerpo de la solicitud
    const { _id, _idRiesgo, nombre, impacto_desc, impacto_num, impacto_porc, probabilidad_desc, probabilidad_num,
        probabilidad_porc, calificacion, riesgo } = req.body;

    try {
        // Verifica si el usuario existe
        const usuario = await Riesgo.findById(_id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Busca el riesgo en el array de riesgos del usuario
        const riesgoActualizado = usuario.riesgos.id(_idRiesgo);

        if (!riesgoActualizado) {
            return res.status(404).json({ error: 'Riesgo no encontrado' });
        }

        // Actualiza los campos del riesgo
        riesgoActualizado.nombre = nombre;
        riesgoActualizado.impacto_desc = impacto_desc;
        riesgoActualizado.impacto_num = impacto_num;
        riesgoActualizado.impacto_porc = impacto_porc;
        riesgoActualizado.probabilidad_desc = probabilidad_desc;
        riesgoActualizado.probabilidad_num = probabilidad_num;
        riesgoActualizado.probabilidad_porc = probabilidad_porc;
        riesgoActualizado.calificacion = calificacion;
        riesgoActualizado.riesgo = riesgo;

        // Guarda los cambios en la base de datos
        await usuario.save();

        res.status(200).json({ mensaje: 'Riesgo actualizado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al actualizar el riesgo' });
    }
};

/*----------------------------------Macroprocesos----------------------------*/

//Registrar Macroproceso y sus riesgos
//Nos permite registra un Macroproceso sin riesgos o
//Si se decide pasarle cualquier cantidad de riesgos en m_riesgos
export const registrarMacroproceso = async (req, res) => {
    //destructurando
    const { _id, m_nombre, m_tipo, m_descripcion, m_riesgos } = req.body;
    const tablemacro = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'macroprocesos': {
                m_nombre,
                m_tipo,
                m_descripcion,
                m_riesgos //Puede recibir cualquier cantidad de riegos en este metodo
            }
        }
    })

    if (!tablemacro) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tablemacro);
}


//Registrar un riesgo de un macroproceso
//Nos permite actualizar un macroriesgos y poderle registrar mas riesgos 
//Es decir si un macroprodeso no tenia riesgos o ya tenia algunos riegos
//podremos actualizarlo y poderle registrar un riesgo
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





//Buscar todos macroprocesos
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

//Buscar todos riesgos de todos los macroprocesos
export const allriesgosAllmacroprocesos = async (req, res) => {
    const { _id } = req.query;
    try {
        // Verifica si el usuario existe
        const usuario = await Riesgo.findById(_id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const macroprocesos = usuario.macroprocesos;
        const mriesgos = macroprocesos.map(macro => macro.m_riesgos);
        const x = mriesgos.flat(1)

        const z = x.map(riesgo => riesgo._id.toHexString());

        const idsunicos = [...new Set(z)];
        
        const ojetoriesgos = usuario.riesgos.filter(riesgo => idsunicos.includes(riesgo._id.toHexString()));

        //console.log(ojetoriesgos.length)
        res.status(200).json(ojetoriesgos);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar los riegos de los macroprocesos' });
    }
};



//Buscar todos riesgos de u macroproceso
export const buscarMacroriesgos = async (req, res) => {
    try {
        const { _id, macroprocesoId } = req.query;

        // Primero, verifica si el usuario existe
        const usuario = await Riesgo.findById(_id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Luego, busca el macroproceso en los macroprocesos del usuario
        const macroproceso = usuario.macroprocesos.find(mp => mp._id == macroprocesoId);
        if (!macroproceso) {
            return res.status(404).json({ error: 'Macroproceso no encontrado' });
        }

        // Finalmente, accede a los m_riesgos del macroproceso
        //const mriesgos = macroproceso.m_riesgos;
        //const mriesgosIds = macroproceso.m_riesgos.map(riesgo => riesgo._id);


        //Buscamos los _id registrados en m_riesgos = array de riesgos
        const mriesgosIds = macroproceso.m_riesgos.map(riesgo => riesgo._id.toHexString());
        //const ids = ["65330d0884d5040688193afc","6531dfd06c327d571bdcabe2","6532d8632dbd9c9c38b596b7"]
        //Utilizamos esos _id en Riesgos
        const ojetoriesgos = usuario.riesgos.filter(riesgo => mriesgosIds.includes(riesgo._id.toHexString()));

        res.status(200).json(ojetoriesgos);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar los m_riesgos' });
    }
};

/*-----------------------------------------Causas-------------------------------------------*/
//Registrar Causas
export const registrarCausa = async (req, res) => {
    //destructurando
    const { _id, nombre, categoria, descripcion } = req.body;
    const tableriesgo = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'causas': {
                nombre,
                categoria,
                descripcion
            }
        }
    })
    if (!tableriesgo) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tableriesgo);
}
//Ver Causas de un usuario especifico
export const buscarCausas = async (req, res) => {
    try {
        const { _id } = req.query; // Obtener el ID del usuario desde los parámetros de la URL

        const documento = await Riesgo.findById(_id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        const causas = documento.causas;
        res.status(200).json(causas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar datos de causas' });
    }
};

export const actualizarRcausas = async (req, res) => {
    const { _idUsuario, _idRiesgo, nuevasCausas } = req.body; // Usar _idUsuario y _idRiesgo

    //Validamos si nuevasCausas tiene datos antes de hacer algun registro
    if (!nuevasCausas || nuevasCausas.length === 0) {
        return res.status(400).json({ error: 'La lista de nuevos riesgos está vacía o no se proporcionó.' });
    }
    try {
        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "riesgos._id": _idRiesgo }, // Usar _idUsuario y _idMacroproceso
            { $push: { 'riesgos.$.r_causas': { $each: nuevasCausas } } }
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
/*-----------------------------------------End Causas---------------------------------------*/

/*-----------------------------------------Consecuencias-------------------------------------------*/
//Registrar Consecuencias
export const registrarConsecuencia = async (req, res) => {
    //destructurando
    const { _id, nombre, categoria, descripcion } = req.body;
    const tableriesgo = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'consecuencias': {
                nombre,
                categoria,
                descripcion
            }
        }
    })
    if (!tableriesgo) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tableriesgo);
}
//Ver Consecuencias de un usuario especifico
export const buscarConsecuencias = async (req, res) => {
    try {
        const { _id } = req.query; // Obtener el ID del usuario desde los parámetros de la URL

        const documento = await Riesgo.findById(_id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        const consecuencias = documento.consecuencias;
        res.status(200).json(consecuencias);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar datos de consecuencias' });
    }
};

export const actualizarRconsecuencias = async (req, res) => {
    const { _idUsuario, _idRiesgo, nuevasConsecuencias } = req.body; // Usar _idUsuario y _idRiesgo

    //Validamos si nuevasConsecuencias tiene datos antes de hacer algun registro
    if (!nuevasConsecuencias || nuevasConsecuencias.length === 0) {
        return res.status(400).json({ error: 'La lista de nuevos consecuencias está vacía o no se proporcionó.' });
    }
    try {
        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "riesgos._id": _idRiesgo }, // Usar _idUsuario y _idRiesgo
            { $push: { 'riesgos.$.r_consecuencias': { $each: nuevasConsecuencias } } }
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
/*-----------------------------------------End Consecuencias---------------------------------------*/

/*-----------------------------------------Controles-------------------------------------------*/
//registrar controles
export const registrarControl = async (req, res) => {
    //destructurando
    const { _id, nombre, complejidad, tipo, descripcion } = req.body;
    const tableriesgo = await Riesgo.updateOne({ _id: _id }, {
        $push: {
            'controles': {
                nombre,
                complejidad,
                tipo,
                descripcion
            }
        }
    })
    if (!tableriesgo) {
        res.status(500).json({ error: "No found" })
    }
    res.status(200).json(tableriesgo);
}
//Ver Controles de un usuario especifico
export const buscarControles = async (req, res) => {
    try {
        const { _id } = req.query; // Obtener el ID del usuario desde los parámetros de la URL

        const documento = await Riesgo.findById(_id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        const controles = documento.controles;
        res.status(200).json(controles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al buscar datos de causas' });
    }
};
export const actualizarRcontroles = async (req, res) => {
    const { _idUsuario, _idRiesgo, nuevasControles } = req.body; // Usar _idUsuario y _idRiesgo

    //Validamos si nuevasControles tiene datos antes de hacer algun registro
    if (!nuevasControles || nuevasControles.length === 0) {
        return res.status(400).json({ error: 'La lista de nuevos riesgos está vacía o no se proporcionó.' });
    }
    try {
        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "riesgos._id": _idRiesgo }, // Usar _idUsuario y _idRiesgo
            { $push: { 'riesgos.$.r_controles': { $each: nuevasControles } } }
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
/*-----------------------------------------End Controles---------------------------------------*/


/*-----------------------------------------Alumnos-----------------------------------------------*/
export const actualizarRalumnos = async (req, res) => {
    const { _idUsuario, _idRiesgo, nuevasAlumnos } = req.body; // Usar _idUsuario y _idRiesgo

    //Validamos si nuevasAlumnos tiene datos antes de hacer algun registro
    if (!nuevasAlumnos || nuevasAlumnos.length === 0) {
        return res.status(400).json({ error: 'La lista de nuevos alumnos está vacía o no se proporcionó.' });
    }
    try {
        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "riesgos._id": _idRiesgo }, // Usar _idUsuario y _idRiesgo
            { $push: { 'riesgos.$.r_alumnos': { $each: nuevasAlumnos } } }
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


export const actualizarRalumnounico = async (req, res) => {
    const { _idUsuario, _idRiesgo, alumnoId, sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8, sem9, sem10, sem11, sem12, sem13, sem14, sem15, sem16 } = req.body;

    if (!_idUsuario || !_idRiesgo || !alumnoId) {
        return res.status(400).json({ error: 'Se requieren _idUsuario, _idRiesgo y alumnoId.' });
    }

    try {
        const updateFields = {};

        if (sem1 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem1'] = sem1;
        }

        if (sem2 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem2'] = sem2;
        }

        if (sem3 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem3'] = sem3;
        }

        if (sem4 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem4'] = sem4;
        }

        if (sem5 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem5'] = sem5;
        }

        if (sem6 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem6'] = sem6;
        }

        if (sem7 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem7'] = sem7;
        }

        if (sem8 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem8'] = sem8;
        }

        if (sem9 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem9'] = sem9;
        }

        if (sem10 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem10'] = sem10;
        }

        if (sem11 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem11'] = sem11;
        }

        if (sem12 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem12'] = sem12;
        }

        if (sem13 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem13'] = sem13;
        }

        if (sem14 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem14'] = sem14;
        }

        if (sem15 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem15'] = sem15;
        }

        if (sem16 !== undefined) {
            updateFields['riesgos.$[r].r_alumnos.$[a].sem16'] = sem16;
        }

        const resultado = await Riesgo.updateOne(
            { "_id": _idUsuario, "riesgos._id": _idRiesgo, "riesgos.r_alumnos._id": alumnoId },
            {
                $set: updateFields
            },
            {
                arrayFilters: [
                    { "r._id": _idRiesgo },
                    { "a._id": alumnoId }
                ]
            }
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


export const obtenerAlumnosDeRiesgo = async (req, res) => {
    const { _idUsuario, _idRiesgo } = req.query;

    try {
        const usuario = await Riesgo.findOne({ "_id": _idUsuario, "riesgos._id": _idRiesgo });

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró el usuario o riesgo.' });
        }

        const riesgo = usuario.riesgos.find(r => r._id.toString() === _idRiesgo);
        const alumnos = riesgo ? riesgo.r_alumnos : [];

        res.status(200).json(alumnos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos de los alumnos: ' + error.message });
    }
};


/*-----------------------------------------End Alumnos-------------------------------------------*/






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