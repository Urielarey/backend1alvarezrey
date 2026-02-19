const CartDAO = require('../dao/CartDAO');
const ProductDAO = require('../dao/ProductDAO');

class CartRepository {
	constructor() {
		this.dao = new CartDAO();
		this.productDAO = new ProductDAO();
	}

	async createCart() {
		return await this.dao.create();
	}

	async getCartById(id) {
		return await this.dao.findById(id);
	}

	async addProductToCart(cartId, productId) {
		const cart = await this.dao.findByIdForUpdate(cartId);
		if (!cart) return null;

		// Verificar que el producto existe
		const product = await this.productDAO.findById(productId);
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

		return await this.dao.save(cart);
	}

	async deleteProductFromCart(cartId, productId) {
		const cart = await this.dao.findByIdForUpdate(cartId);
		if (!cart) return null;

		cart.products = cart.products.filter(
			p => p.product.toString() !== productId.toString()
		);

		return await this.dao.save(cart);
	}

	async updateCart(cartId, products) {
		const cart = await this.dao.findByIdForUpdate(cartId);
		if (!cart) return null;

		// Validar que todos los productos existen
		for (const item of products) {
			const product = await this.productDAO.findById(item.product);
			if (!product) {
				const err = new Error(`Producto ${item.product} no encontrado`);
				err.status = 404;
				throw err;
			}
		}

		cart.products = products;
		return await this.dao.save(cart);
	}

	async updateProductQuantity(cartId, productId, quantity) {
		const cart = await this.dao.findByIdForUpdate(cartId);
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
		return await this.dao.save(cart);
	}

	async deleteAllProductsFromCart(cartId) {
		const cart = await this.dao.findByIdForUpdate(cartId);
		if (!cart) return null;

		cart.products = [];
		return await this.dao.save(cart);
	}
}

module.exports = CartRepository;
