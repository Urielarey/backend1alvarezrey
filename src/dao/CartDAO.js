const Cart = require('../models/Cart');

class CartDAO {
	async create() {
		const cart = new Cart({ products: [] });
		await cart.save();
		return cart.toObject();
	}

	async findById(id) {
		try {
			const cart = await Cart.findById(id)
				.populate('products.product')
				.lean();
			return cart;
		} catch (error) {
			return null;
		}
	}

	async findByIdForUpdate(id) {
		try {
			const cart = await Cart.findById(id);
			return cart;
		} catch (error) {
			return null;
		}
	}

	async update(id, updateData) {
		const updated = await Cart.findByIdAndUpdate(id, updateData, { new: true })
			.populate('products.product')
			.lean();
		return updated;
	}

	async save(cart) {
		await cart.save();
		return await Cart.findById(cart._id)
			.populate('products.product')
			.lean();
	}

	async delete(id) {
		const result = await Cart.findByIdAndDelete(id);
		return result !== null;
	}
}

module.exports = CartDAO;
