const { Router } = require('express');
const { authenticate } = require('../middlewares/authorization');
const {
	register,
	login,
	getCurrentUser,
	forgotPassword,
	resetPassword
} = require('../controllers/sessions.controller');

const router = Router();

// POST /api/sessions/register - Registrar un nuevo usuario
router.post('/register', register);

// POST /api/sessions/login - Iniciar sesión
router.post('/login', login);

// POST /api/sessions/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPassword);

// POST /api/sessions/reset-password - Restablecer contraseña
router.post('/reset-password', resetPassword);

// GET /api/sessions/current - Obtener usuario actual (requiere autenticación)
router.get('/current', authenticate, getCurrentUser);

module.exports = router;
