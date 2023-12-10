
import {Schema , model} from "mongoose";

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
    r_alumnos: [alumnoSchema],
    fecha: { type: Date, default: Date.now } 
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
    telefono: { type: String },
    riesgos: [riesgoSchema] 
   
});


export const Riesgo = model('Riesgo' , mySchema)
