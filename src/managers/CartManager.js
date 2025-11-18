const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartManager {
	async createCart() {
		const newCart = new Cart({ products: [] });
		await newCart.save();
		return newCart.toObject();
	}

	async getCartById(id) {
		try {
			const cart = await Cart.findById(id)
				.populate('products.product')
				.lean();
			return cart;
		} catch (error) {
			return null;
		}
	}

	async addProductToCart(cartId, productId) {
		const cart = await Cart.findById(cartId);
		if (!cart) return null;

		// Verificar que el producto existe
		const product = await Product.findById(productId);
		if (!product) {
			const err = new Error('Producto no encontrado');
			err.status = 404;
			throw err;
		}

		// Buscar si el producto ya está en el carrito
		const existingProduct = cart.products.find(
			p => p.product.toString() === productId.toString()
		);

		if (existingProduct) {
			existingProduct.quantity += 1;
		} else {
			cart.products.push({ product: productId, quantity: 1 });
		}

		await cart.save();
		return await Cart.findById(cartId).populate('products.product').lean();
	}

	async deleteProductFromCart(cartId, productId) {
		const cart = await Cart.findById(cartId);
		if (!cart) return null;

		cart.products = cart.products.filter(
			p => p.product.toString() !== productId.toString()
		);

		await cart.save();
		return await Cart.findById(cartId).populate('products.product').lean();
	}

	async updateCart(cartId, products) {
		const cart = await Cart.findById(cartId);
		if (!cart) return null;

		// Validar que todos los productos existen
		for (const item of products) {
			const product = await Product.findById(item.product);
			if (!product) {
				const err = new Error(`Producto ${item.product} no encontrado`);
				err.status = 404;
				throw err;
			}
		}

		cart.products = products;
		await cart.save();
		return await Cart.findById(cartId).populate('products.product').lean();
	}

	async updateProductQuantity(cartId, productId, quantity) {
		const cart = await Cart.findById(cartId);
		if (!cart) return null;

		const product = cart.products.find(
			p => p.product.toString() === productId.toString()
		);

		if (!product) {
			const err = new Error('Producto no encontrado en el carrito');
			err.status = 404;
			throw err;
		}

		product.quantity = quantity;
		await cart.save();
		return await Cart.findById(cartId).populate('products.product').lean();
	}

	async deleteAllProductsFromCart(cartId) {
		const cart = await Cart.findById(cartId);
		if (!cart) return null;

		cart.products = [];
		await cart.save();
		return await Cart.findById(cartId).populate('products.product').lean();
	}
}

module.exports = CartManager;
