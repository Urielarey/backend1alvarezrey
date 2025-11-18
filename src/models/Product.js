const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true,
		unique: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	status: {
		type: Boolean,
		default: true
	},
	stock: {
		type: Number,
		required: true,
		min: 0
	},
	category: {
		type: String,
		required: true
	},
	thumbnails: {
		type: [String],
		default: []
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

