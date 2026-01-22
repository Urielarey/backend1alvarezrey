const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key_super_segura_cambiar_en_produccion';

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Objeto usuario con _id
 * @returns {String} Token JWT
 */
const generateToken = (user) => {
	const payload = {
		sub: user._id,
		email: user.email,
		role: user.role
	};
	
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: '24h'
	});
};

/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token JWT
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
	return jwt.verify(token, JWT_SECRET);
};

module.exports = {
	generateToken,
	verifyToken
};


