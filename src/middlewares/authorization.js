const passport = require('passport');

/**
 * Middleware para verificar que el usuario esté autenticado
 */
const authenticate = (req, res, next) => {
	passport.authenticate('current', { session: false }, (err, user, info) => {
		if (err) {
			return res.status(401).json({
				status: 'error',
				message: 'Token inválido o no proporcionado'
			});
		}
		if (!user) {
			return res.status(401).json({
				status: 'error',
				message: 'Token inválido o usuario no encontrado'
			});
		}
		req.user = user;
		next();
	})(req, res, next);
};

/**
 * Middleware para verificar que el usuario sea administrador
 */
const authorizeAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			status: 'error',
			message: 'No autorizado'
		});
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({
			status: 'error',
			message: 'Acceso denegado. Solo administradores pueden realizar esta acción.'
		});
	}

	next();
};

/**
 * Middleware para verificar que el usuario sea un usuario regular (no admin)
 */
const authorizeUser = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			status: 'error',
			message: 'No autorizado'
		});
	}

	if (req.user.role !== 'user') {
		return res.status(403).json({
			status: 'error',
			message: 'Acceso denegado. Solo usuarios pueden realizar esta acción.'
		});
	}

	next();
};

/**
 * Middleware combinado: autenticación + autorización admin
 */
const requireAdmin = [authenticate, authorizeAdmin];

/**
 * Middleware combinado: autenticación + autorización user
 */
const requireUser = [authenticate, authorizeUser];

module.exports = {
	authenticate,
	authorizeAdmin,
	authorizeUser,
	requireAdmin,
	requireUser
};
