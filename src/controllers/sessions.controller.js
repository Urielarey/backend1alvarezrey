const User = require('../models/User');
const Cart = require('../models/Cart');
const { generateToken } = require('../utils/jwt');

// POST /api/sessions/register - Registrar un nuevo usuario
const register = async (req, res, next) => {
	try {
		const { first_name, last_name, email, age, password } = req.body;
		
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
		
		// Crear el usuario (la contraseña se encriptará automáticamente)
		const user = new User({
			first_name,
			last_name,
			email,
			age,
			password, // Se encriptará automáticamente en el pre-save hook
			cart: cart._id,
			role: 'user'
		});
		
		await user.save();
		
		// Generar token JWT
		const token = generateToken(user);
		
		// Retornar usuario sin contraseña
		const userResponse = await User.findById(user._id).select('-password').populate('cart');
		
		res.status(201).json({
			status: 'success',
			message: 'Usuario registrado exitosamente',
			payload: {
				user: userResponse,
				token
			}
		});
	} catch (error) {
		next(error);
	}
};

// POST /api/sessions/login - Iniciar sesión
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		
		// Validar campos requeridos
		if (!email || !password) {
			return res.status(400).json({
				status: 'error',
				message: 'Email y contraseña son requeridos'
			});
		}
		
		// Buscar usuario por email
		const user = await User.findOne({ email });
		
		if (!user) {
			return res.status(401).json({
				status: 'error',
				message: 'Credenciales inválidas'
			});
		}
		
		// Verificar contraseña
		const isPasswordValid = user.comparePassword(password);
		
		if (!isPasswordValid) {
			return res.status(401).json({
				status: 'error',
				message: 'Credenciales inválidas'
			});
		}
		
		// Generar token JWT
		const token = generateToken(user);
		
		// Retornar usuario sin contraseña
		const userResponse = await User.findById(user._id).select('-password').populate('cart');
		
		res.json({
			status: 'success',
			message: 'Login exitoso',
			payload: {
				user: userResponse,
				token
			}
		});
	} catch (error) {
		next(error);
	}
};

// GET /api/sessions/current - Obtener usuario actual (requiere autenticación)
const getCurrentUser = async (req, res, next) => {
	try {
		// El usuario ya está disponible en req.user gracias a la estrategia de Passport
		if (!req.user) {
			return res.status(401).json({
				status: 'error',
				message: 'No autorizado'
			});
		}
		
		// Obtener usuario completo con carrito
		const user = await User.findById(req.user._id).select('-password').populate('cart');
		
		res.json({
			status: 'success',
			payload: user
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	register,
	login,
	getCurrentUser
};


