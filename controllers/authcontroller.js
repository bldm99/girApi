import { verifyTokenRefresh } from "../utils/tokenManager.js";


//Cerrar sesion de usuario
export const logout = async (req, res) => {
    res.clearCookie('refreshToken')
    res.json({ ok: true })
}


export const verifyRefreshToken = (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      throw new Error('No existe el token');
    }

    const decodedToken = verifyTokenRefresh(refreshTokenCookie);
                         

    // Realizar más lógica según tu necesidad con el decodedToken

    // Si llegamos aquí, el token es válido
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);

    const TokenVerificationErrors = {
      'invalid signature': 'La firma de JWT no es valida',
      'jwt expired': 'JWT expirado',
      'invalid token': 'Token no valido',
      'No Bearer': 'Utiliza formato Bearer',
      'jwt malformed': 'JWT formato no valido',
      'Error al verificar el token': 'Error al verificar el token',
      'No existe el token': 'No existe el token',
      // Agrega más casos según sea necesario
    };

    return res.status(401).send({ error: TokenVerificationErrors[error.message] || 'Error inesperado al verificar el token' });
  }
};