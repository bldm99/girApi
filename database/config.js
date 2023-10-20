
import mongoose from "mongoose"
import "dotenv/config" 

const Co = 'mongodb+srv://bldm147:5eI0JHrqszPDO7rb@cluster0.npwmfxa.mongodb.net/dbapi?retryWrites=true&w=majority'

export async function connect() {
    try {
        await mongoose.connect(Co)
        console.log("Conectado con Mogodb")
    } catch (error) {
        
        console.log("Error de conexion a mongo db:" + error)

    }
}



