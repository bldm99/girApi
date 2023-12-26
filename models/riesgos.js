import {Schema , model} from "mongoose";
import bcryptjs from "bcryptjs"

const causaSchema = new Schema({
    nombre: { type: String },
    categoria: { type: String },
    descripcion: { type: String }, 
});
const consecuenciaSchema = new Schema({
    nombre: { type: String },
    categoria: { type: String },
    descripcion: { type: String }, 
});

const controlSchema = new Schema({
    nombre: { type: String },
    complejidad: { type: String },
    tipo:{ type: String },
    descripcion: { type: String }, 
});

const alumnoSchema = new Schema({
    nombre: { type: String },
    curso: { type: String },
    correo: { type: String },
    wasap: { type: Number },
    sem1: { type: Number },
    sem2: { type: Number },
    sem3: { type: Number },
    sem4: { type: Number },
    sem5: { type: Number },
    sem6: { type: Number },
    sem7: { type: Number },
    sem8: { type: Number },
    sem9: { type: Number },
    sem10: { type: Number },
    sem11: { type: Number },
    sem12: { type: Number },
    sem13: { type: Number },
    sem14: { type: Number },
    sem15: { type: Number },
    sem16: { type: Number },
    
});




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
    r_causas: [causaSchema],
    r_consecuencias: [consecuenciaSchema],
    r_controles: [controlSchema],
    r_alumnos: [alumnoSchema],
    fecha: { type: Date, default: Date.now } // Agrega el campo 'fecha' con la fecha actual por defecto
});

const procesoSchema = new Schema({
    p_nombre: { type: String },
    p_tipo: { type: String },
    p_dependencia: { type: String },
    p_descripcion: { type: String },
    p_riesgos: [riesgoSchema],
});

const macroproscesoSchema = new Schema({
    m_nombre: { type: String },
    m_tipo: { type: String },
    m_descripcion: { type: String }, 
    m_riesgos: [riesgoSchema],
    
    m_procesos: [procesoSchema],
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
    macroprocesos: [macroproscesoSchema],
    causas: [causaSchema],
    consecuencias: [consecuenciaSchema],
    controles: [controlSchema]
});


mySchema.methods.comparePassword = async function(candidatePassword){
    //this nos permite acceder a una propiedad en este caso u_password
    return await bcryptjs.compare(candidatePassword , this.u_password)
}


export const Riesgo = model('Riesgo' , mySchema)


