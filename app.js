
import "dotenv/config" 
import express from "express"
import "./database/config.js"
import xrouter from "./routes/routes.js"

import cors from "cors"
import cookieParser from "cookie-parser"


import { connect } from "./database/config.js"

const app = express()
//Configuaracion express
app.use(express.json())
app.use(cookieParser())
//app.use(cors())
app.use(
    cors({
      origin: "https://gir-project.vercel.app", // Reemplaza esto con la URL de tu aplicación React
      credentials: true,
    })
);
app.use(express.urlencoded({extended: true}))
app.use("/",xrouter)



app.get("/", (req, res) => {
    res.send("Hola mundo and hello word");
});


const PORT = process.env.PORT || 5000
connect() //importnte siempre colocar esto
app.listen(PORT , () => console.log("http://localhost:" + PORT))