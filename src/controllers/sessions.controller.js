const UserRepository = require('../repositories/UserRepository');
const { generateToken } = require('../utils/jwt');
const UserDTO = require('../dto/UserDTO');
const crypto = require('crypto');
const EmailService = require('../services/emailService');

const userRepository = new UserRepository();
const emailService = new EmailService();

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
		
		// Crear usuario usando repository
		const user = await userRepository.createUser({
			first_name,
			last_name,
			email,
			age,
			password,
			role: 'user'
		});
		
		// Generar token JWT
		const token = generateToken(user);
		
		// Retornar usuario usando DTO
		const userDTO = UserDTO.fromUser(user);
		
		res.status(201).json({
			status: 'success',
			message: 'Usuario registrado exitosamente',
			payload: {
				user: userDTO.toJSON(),
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
		
		// Buscar usuario usando repository
		const user = await userRepository.getUserByEmail(email);
		
		if (!user) {
			return res.status(401).json({
				status: 'error',
				message: 'Credenciales inválidas'
			});
		}
		
		// Verificar contraseña usando repository
		const isPasswordValid = await userRepository.validatePassword(user, password);
		
		if (!isPasswordValid) {
			return res.status(401).json({
				status: 'error',
				message: 'Credenciales inválidas'
			});
		}
		
		// Generar token JWT
		const token = generateToken(user);
		
		// Obtener usuario completo sin contraseña
		const userWithoutPassword = await userRepository.getUserById(user._id.toString());
		
		// Retornar usuario usando DTO
		const userDTO = UserDTO.fromUser(userWithoutPassword);
		
		res.json({
			status: 'success',
			message: 'Login exitoso',
			payload: {
				user: userDTO.toJSON(),
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
		// El usuario ya está disponible en req.user gracias al middleware de autenticación
		if (!req.user) {
			return res.status(401).json({
				status: 'error',
				message: 'No autorizado'
			});
		}
		
		// Obtener usuario completo usando repository
		const user = await userRepository.getUserById(req.user._id.toString());
		
		if (!user) {
			return res.status(404).json({
				status: 'error',
				message: 'Usuario no encontrado'
			});
		}
		
		// Retornar usuario usando DTO (sin información sensible)
		const userDTO = UserDTO.fromUser(user);
		
		res.json({
			status: 'success',
			payload: userDTO.toJSON()
		});
	} catch (error) {
		next(error);
	}
};

// POST /api/sessions/forgot-password - Solicitar recuperación de contraseña
const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({
				status: 'error',
				message: 'Email es requerido'
			});
		}
		
		// Buscar usuario
		const user = await userRepository.getUserByEmail(email);
		
		// Por seguridad, siempre retornar éxito aunque el usuario no exista
		if (!user) {
			return res.json({
				status: 'success',
				message: 'Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña'
			});
		}
		
		// Generar token de recuperación
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetExpires = new Date(Date.now() + 3600000); // 1 hora
		
		// Guardar token en el usuario
		await userRepository.setResetPasswordToken(email, resetToken, resetExpires);
		
		// Enviar email
		try {
			await emailService.sendPasswordResetEmail(email, resetToken);
		} catch (emailError) {
			console.error('Error al enviar email:', emailError);
			// No fallar la petición si el email falla, pero loguear el error
		}
		
		res.json({
			status: 'success',
			message: 'Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña'
		});
	} catch (error) {
		next(error);
	}
};

// POST /api/sessions/reset-password - Restablecer contraseña
const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword } = req.body;
		
		if (!token || !newPassword) {
			return res.status(400).json({
				status: 'error',
				message: 'Token y nueva contraseña son requeridos'
			});
		}
		
		if (newPassword.length < 6) {
			return res.status(400).json({
				status: 'error',
				message: 'La contraseña debe tener al menos 6 caracteres'
			});
		}
		
		// Restablecer contraseña usando repository
		const user = await userRepository.resetPassword(token, newPassword);
		
		// Retornar usuario usando DTO
		const userDTO = UserDTO.fromUser(user);
		
		res.json({
			status: 'success',
			message: 'Contraseña restablecida exitosamente',
			payload: {
				user: userDTO.toJSON()
			}
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

module.exports = {
	register,
	login,
	getCurrentUser,
	forgotPassword,
	resetPassword
};
