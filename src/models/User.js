const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	age: {
		type: Number,
		required: true,
		min: 0
	},
	password: {
		type: String,
		required: true
	},
	cart: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Cart'
	},
	role: {
		type: String,
		default: 'user',
		enum: ['user', 'admin']
	}
}, {
	timestamps: true
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function(next) {
	// Solo encriptar si la contraseña fue modificada
	if (!this.isModified('password')) {
		return next();
	}
	
	try {
		// Encriptar la contraseña usando bcrypt.hashSync
		this.password = bcrypt.hashSync(this.password, 10);
		next();
	} catch (error) {
		next(error);
	}
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function(candidatePassword) {
	return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


