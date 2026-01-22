const { Router } = require('express');
const passport = require('passport');
const {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser
} = require('../controllers/users.controller');

const router = Router();

// Middleware de autenticación JWT (opcional, dependiendo de si quieres proteger todas las rutas)
// const authenticateJWT = passport.authenticate('jwt', { session: false });

// GET /api/users - Obtener todos los usuarios
router.get('/', getUsers);

// GET /api/users/:uid - Obtener un usuario por ID
router.get('/:uid', getUserById);

// POST /api/users - Crear un nuevo usuario
router.post('/', createUser);

// PUT /api/users/:uid - Actualizar un usuario
router.put('/:uid', updateUser);

// DELETE /api/users/:uid - Eliminar un usuario
router.delete('/:uid', deleteUser);

module.exports = router;


