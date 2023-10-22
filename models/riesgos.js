import {Schema , model} from "mongoose";

/*const mySchema = new Schema({
    user: { type: String },
    u_email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        //index: {unique: true}
    },
    u_password: {
        type: String,
        required: true,
    },

    telefono: { type: String },
    tarjeta: { type: String },
    suscripcion: { type: String },

    riesgos: [{
        nombre: { type: String },
        impacto_desc: { type: String },
        impacto_num: { type: String },
        impacto_porc: { type: String },
        probabilidad_desc: { type: String },
        probabilidad_num: { type: String },
        probabilidad_porc: { type: String },
        calificacion: { type: String },
        riesgo: { type: String },
        proceso_asignado: {type: String},
    }]
})*/
const riesgoSchema = new Schema({
    nombre: { type: String },
    impacto_desc: { type: String },
    impacto_num: { type: String },
    impacto_porc: { type: String },
    probabilidad_desc: { type: String },
    probabilidad_num: { type: String },
    probabilidad_porc: { type: String },
    calificacion: { type: String },
    riesgo: { type: String },
    proceso_asignado: { type: String },
    fecha: { type: Date, default: Date.now } // Agrega el campo 'fecha' con la fecha actual por defecto
});
const macroproscesoSchema = new Schema({
    m_nombre: { type: String },
    m_tipo: { type: String },
    m_categoria: { type: String },
    m_descripcion: { type: String }, 
    fecha: { type: Date, default: Date.now } // Agrega el campo 'fecha' con la fecha actual por defecto
});

const mySchema = new Schema({
    user: { type: String },
    u_email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    u_password: { type: String, required: true },
    telefono: { type: String },
    tarjeta: { type: String },
    suscripcion: { type: String },
    riesgos: [riesgoSchema] ,// Utiliza el subesquema 'riesgoSchema'
    macroprocesos: [macroproscesoSchema]
});


export const Riesgo = model('Riesgo' , mySchema)
