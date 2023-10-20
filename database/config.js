
import mongoose from "mongoose"
import "dotenv/config" 

export async function connect() {
    try {
        await mongoose.connect(process.env.XMONGODB_URL)
        console.log("Conectado con Mogodb")
    } catch (error) {
        
        console.log("Error de conexion a mongo db:" + error)

    }
}



