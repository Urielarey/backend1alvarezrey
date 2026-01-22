const { Router } = require('express');
const passport = require('passport');
const {
	register,
	login,
	getCurrentUser
} = require('../controllers/sessions.controller');

const router = Router();

// POST /api/sessions/register - Registrar un nuevo usuario
router.post('/register', register);

// POST /api/sessions/login - Iniciar sesión
router.post('/login', login);

// GET /api/sessions/current - Obtener usuario actual (requiere autenticación)
// Usa la estrategia "current" de Passport para validar el token JWT
router.get('/current', 
	(req, res, next) => {
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
	},
	getCurrentUser
);

module.exports = router;

