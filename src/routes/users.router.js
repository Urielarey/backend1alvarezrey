const { Router } = require('express');
const { requireAdmin, authenticate } = require('../middlewares/authorization');
const {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser
} = require('../controllers/users.controller');

const router = Router();

// GET /api/users - Obtener todos los usuarios (requiere autenticación)
router.get('/', authenticate, getUsers);

// GET /api/users/:uid - Obtener un usuario por ID (requiere autenticación)
router.get('/:uid', authenticate, getUserById);

// POST /api/users - Crear un nuevo usuario (solo admin)
router.post('/', requireAdmin, createUser);

// PUT /api/users/:uid - Actualizar un usuario (solo admin)
router.put('/:uid', requireAdmin, updateUser);

// DELETE /api/users/:uid - Eliminar un usuario (solo admin)
router.delete('/:uid', requireAdmin, deleteUser);

module.exports = router;
