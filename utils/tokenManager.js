
import  jwt  from 'jsonwebtoken'
export const generateToken = (uid , em) => {
    const expiresIn = 60 * 15
    try {
        //generamos el token con el id y el email 
        const token = jwt.sign({uid , em} , process.env.JWT_SECRET , {expiresIn})
        return {token , expiresIn}
    } catch (error) {
        console.log(error)
    }
}

export const generateRefreshToken = (uid , em , res) => {
    const expiresIn = 60 * 60 * 24 * 30 //30 dias aprox
    try {
        //generamos el token con el id y el email 
        const refreshToken = jwt.sign({uid , em} , process.env.JWT_REFRESH , {expiresIn})
        res.cookie("refreshToken", refreshToken , {
            //la cookie solo viviera en el http y no podra ser accedidp po js en frontend
            httpOnly: true ,
            //
            /*secure: !(process.env.MODO === "developer"),*/
            secure: false,
            expires: new Date(Date.now() + expiresIn * 1000)

        })

    } catch (error) {
        console.log(error)
    }
}


export const verifyTokenRefresh = (token) => {
    try {
      // Verificamos la validez del token
      const decodedToken = jwt.verify(token, process.env.JWT_REFRESH);
  
      // Puedes realizar más verificaciones según tu lógica aquí
  
      // Si no hay errores, devuelve el token decodificado
      return decodedToken;
    } catch (error) {
      // Maneja los errores de verificación y lanza un nuevo error con un mensaje específico
      console.error('Error al verificar el token:', error.message);
      throw new Error('Error al verificar el token');
    }
  };