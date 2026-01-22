const User = require('../models/User');
const Cart = require('../models/Cart');

// GET /api/users - Obtener todos los usuarios
const getUsers = async (req, res, next) => {
	try {
		const users = await User.find().select('-password').populate('cart');
		res.json({ status: 'success', payload: users });
	} catch (error) {
		next(error);
	}
};

// GET /api/users/:uid - Obtener un usuario por ID
const getUserById = async (req, res, next) => {
	try {
		const { uid } = req.params;
		const user = await User.findById(uid).select('-password').populate('cart');
		
		if (!user) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		res.json({ status: 'success', payload: user });
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
		
		// Verificar si el usuario ya existe
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				status: 'error',
				message: 'El email ya está registrado'
			});
		}
		
		// Crear un carrito vacío para el usuario
		const cart = new Cart({ products: [] });
		await cart.save();
		
		// Crear el usuario (la contraseña se encriptará automáticamente por el pre-save hook)
		const user = new User({
			first_name,
			last_name,
			email,
			age,
			password, // Se encriptará automáticamente
			cart: cart._id,
			role: role || 'user'
		});
		
		await user.save();
		
		// Retornar usuario sin contraseña
		const userResponse = await User.findById(user._id).select('-password').populate('cart');
		
		res.status(201).json({
			status: 'success',
			message: 'Usuario creado exitosamente',
			payload: userResponse
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
		
		const user = await User.findById(uid);
		
		if (!user) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		// Actualizar campos si se proporcionan
		if (first_name) user.first_name = first_name;
		if (last_name) user.last_name = last_name;
		if (email) {
			// Verificar que el email no esté en uso por otro usuario
			const existingUser = await User.findOne({ email, _id: { $ne: uid } });
			if (existingUser) {
				return res.status(400).json({
					status: 'error',
					message: 'El email ya está en uso por otro usuario'
				});
			}
			user.email = email;
		}
		if (age !== undefined) user.age = age;
		if (password) {
			// Si se proporciona una nueva contraseña, se encriptará automáticamente
			user.password = password;
		}
		if (role) user.role = role;
		
		await user.save();
		
		const userResponse = await User.findById(user._id).select('-password').populate('cart');
		
		res.json({
			status: 'success',
			message: 'Usuario actualizado exitosamente',
			payload: userResponse
		});
	} catch (error) {
		next(error);
	}
};

// DELETE /api/users/:uid - Eliminar un usuario
const deleteUser = async (req, res, next) => {
	try {
		const { uid } = req.params;
		
		const user = await User.findById(uid);
		
		if (!user) {
			return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
		}
		
		// Eliminar el carrito asociado
		if (user.cart) {
			await Cart.findByIdAndDelete(user.cart);
		}
		
		await User.findByIdAndDelete(uid);
		
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


