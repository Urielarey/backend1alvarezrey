const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
	code: {
		type: String,
		required: true,
		unique: true
	},
	purchase_datetime: {
		type: Date,
		default: Date.now
	},
	amount: {
		type: Number,
		required: true,
		min: 0
	},
	purchaser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	products: [{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true
		},
		quantity: {
			type: Number,
			required: true,
			min: 1
		},
		price: {
			type: Number,
			required: true,
			min: 0
		}
	}]
}, {
	timestamps: true
});

// Generar código único antes de guardar
ticketSchema.pre('save', async function(next) {
	if (!this.code) {
		// Generar código único basado en timestamp y random
		this.code = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
	}
	next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
