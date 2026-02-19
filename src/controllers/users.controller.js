const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dto/UserDTO');

const userRepository = new UserRepository();

// GET /api/users - Obtener todos los usuarios
const getUsers = async (req, res, next) => {
	try {
		const users = await userRepository.getUsers();
		const usersDTO = users.map(user => UserDTO.fromUser(user).toJSON());
		res.json({ status: 'success', payload: usersDTO });
	} catch (error) {
		next(error);
	}
};

// GET /api/users/:uid - Obtener un usuario por ID
const getUserById = async (req, res, next) => {
	try {
		const { uid } = req.params;
		const user = await userRepository.getUserById(uid);
		
		if (!user) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		const userDTO = UserDTO.fromUser(user);
		res.json({ status: 'success', payload: userDTO.toJSON() });
	} catch (error) {
		next(error);
	}
};

// POST /api/users - Crear un nuevo usuario
const createUser = async (req, res, next) => {
	try {
		const { first_name, last_name, email, age, password, role } = req.body;
		
		// Validar campos requeridos
		if (!first_name || !last_name || !email || !age || !password) {
			return res.status(400).json({
				status: 'error',
				message: 'Faltan campos requeridos: first_name, last_name, email, age, password'
			});
		}
		
		// Crear usuario usando repository
		const user = await userRepository.createUser({
			first_name,
			last_name,
			email,
			age,
			password,
			role: role || 'user'
		});
		
		const userDTO = UserDTO.fromUser(user);
		
		res.status(201).json({
			status: 'success',
			message: 'Usuario creado exitosamente',
			payload: userDTO.toJSON()
		});
	} catch (error) {
		next(error);
	}
};

// PUT /api/users/:uid - Actualizar un usuario
const updateUser = async (req, res, next) => {
	try {
		const { uid } = req.params;
		const { first_name, last_name, email, age, password, role } = req.body;
		
		const updateData = {};
		if (first_name) updateData.first_name = first_name;
		if (last_name) updateData.last_name = last_name;
		if (email) updateData.email = email;
		if (age !== undefined) updateData.age = age;
		if (password) updateData.password = password;
		if (role) updateData.role = role;
		
		const user = await userRepository.updateUser(uid, updateData);
		
		if (!user) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		const userDTO = UserDTO.fromUser(user);
		
		res.json({
			status: 'success',
			message: 'Usuario actualizado exitosamente',
			payload: userDTO.toJSON()
		});
	} catch (error) {
		if (error.status === 400) {
			return res.status(400).json({
				status: 'error',
				message: error.message
			});
		}
		next(error);
	}
};

// DELETE /api/users/:uid - Eliminar un usuario
const deleteUser = async (req, res, next) => {
	try {
		const { uid } = req.params;
		
		const deleted = await userRepository.deleteUser(uid);
		
		if (!deleted) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		res.json({
			status: 'success',
			message: 'Usuario eliminado exitosamente'
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser
};
