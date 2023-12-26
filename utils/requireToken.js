import  jwt  from 'jsonwebtoken'

/*export const requireToken = (req , res , next) => {
    try {
        //importante colocar el nombre que le pusimo a nuestra cookie en este caso el nombre es token
        let token = req.cookies.token

        //sino existe el token?
        if(!token) throw new Error('No Bearer')

        //token = token.split(' ')[1]

        //si existe el verificamos si es un token valido
        const {uid , em}  = jwt.verify(token , process.env.JWT_SECRET)
      
        //req perzonalizado
        req.uid = uid

        next()
    } catch (error) {
        console.log(error.message)

        const TokenVerificationErrors = {
            "invalid signature": "La firma de JWT no es valida",
            "jwt expired": "JWT expirado",
            "invalid token": "Token no valido",
            "No Bearer": "Utiliza formato Bearer",
            "jwt malformed": "JWT formato no valido"
        }
        return res.status(401)
        .send({error: TokenVerificationErrors[error.message]})
    }
}*/


export const requireToken = (req , res , next) => {
    try {
        let token = req.headers?.authorization

        //sino existe el token?
        if(!token) throw new Error('No Bearer')

        token = token.split(' ')[1]

        //si existe el verificamos si es un token valido
        const {uid , em}  = jwt.verify(token , process.env.JWT_SECRET)
      
        //req perzonalizado
        req.uid = uid

        next()
    } catch (error) {
        console.log(error.message)

        const TokenVerificationErrors = {
            "invalid signature": "La firma de JWT no es valida",
            "jwt expired": "JWT expirado",
            "invalid token": "Token no valido",
            "No Bearer": "Utiliza formato Bearer",
            "jwt malformed": "JWT formato no valido"
        }
        return res.status(401)
        .send({error: TokenVerificationErrors[error.message]})
    }
}