const UserDAO = require('../dao/UserDAO');
const CartDAO = require('../dao/CartDAO');
const bcrypt = require('bcrypt');

class UserRepository {
	constructor() {
		this.dao = new UserDAO();
		this.cartDAO = new CartDAO();
	}

	async getUsers() {
		return await this.dao.findAll();
	}

	async getUserById(id) {
		return await this.dao.findById(id);
	}

	async getUserByEmail(email) {
		return await this.dao.findByEmail(email);
	}

	async createUser(userData) {
		// Verificar si el usuario ya existe
		const existingUser = await this.dao.findByEmail(userData.email);
		if (existingUser) {
			const err = new Error('El email ya está registrado');
			err.status = 400;
			throw err;
		}

		// Crear un carrito vacío para el usuario
		const cart = await this.cartDAO.create();
		
		// Crear el usuario (la contraseña se encriptará automáticamente)
		const user = await this.dao.create({
			...userData,
			cart: cart._id || cart,
			role: userData.role || 'user'
		});

		// El método create retorna un documento de Mongoose, obtener el ID
		const userId = user._id ? user._id.toString() : user.toString();
		return await this.dao.findById(userId);
	}

	async updateUser(id, updateData) {
		// Si se está actualizando el email, verificar que no esté en uso
		if (updateData.email) {
			const existingUser = await this.dao.findByEmail(updateData.email);
			if (existingUser && existingUser._id.toString() !== id) {
				const err = new Error('El email ya está en uso por otro usuario');
				err.status = 400;
				throw err;
			}
		}

		return await this.dao.updateWithPassword(id, updateData);
	}

	async deleteUser(id) {
		const user = await this.dao.findByIdWithPassword(id);
		if (!user) return false;

		// Eliminar el carrito asociado
		if (user.cart) {
			await this.cartDAO.delete(user.cart.toString());
		}

		return await this.dao.delete(id);
	}

	async validatePassword(user, password) {
		return user.comparePassword(password);
	}

	async setResetPasswordToken(email, token, expires) {
		const user = await this.dao.findByEmail(email);
		if (!user) return null;

		user.resetPasswordToken = token;
		user.resetPasswordExpires = expires;
		await user.save();

		return user;
	}

	async resetPassword(token, newPassword) {
		const user = await this.dao.findByResetToken(token);
		if (!user) {
			const err = new Error('Token inválido o expirado');
			err.status = 400;
			throw err;
		}

		// Verificar que la nueva contraseña no sea la misma que la anterior
		const isSamePassword = user.comparePassword(newPassword);
		if (isSamePassword) {
			const err = new Error('La nueva contraseña debe ser diferente a la anterior');
			err.status = 400;
			throw err;
		}

		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		return await this.dao.findById(user._id.toString());
	}
}

module.exports = UserRepository;
