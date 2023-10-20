
import "dotenv/config" 
import express from "express"
import "./database/config.js"
import xrouter from "./routes/routes.js"

import cors from "cors"
import { connect } from "./database/config.js"

const app = express()

//Configuaracion express
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use("/",xrouter)



app.get("/", (req, res) => {
    res.send("Hola mundo");
});


const PORT = process.env.PORT || 5000
connect() //importnte siempre colocar esto
app.listen(PORT , () => console.log("http://localhost:" + PORT))