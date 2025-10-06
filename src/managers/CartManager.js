const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

class CartManager {
	constructor(filePath) {
		this.filePath = filePath;
	}

	async #readFile() {
		try {
			const data = await fs.readFile(this.filePath, 'utf-8');
			return JSON.parse(data || '[]');
		} catch (err) {
			if (err.code === 'ENOENT') return [];
			throw err;
		}
	}

	async #writeFile(items) {
		await fs.mkdir(path.dirname(this.filePath), { recursive: true });
		await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
	}

	async createCart() {
		const items = await this.#readFile();
		const newCart = { id: randomUUID(), products: [] };
		items.push(newCart);
		await this.#writeFile(items);
		return newCart;
	}

	async getCartById(id) {
		const items = await this.#readFile();
		return items.find(c => String(c.id) === String(id));
	}

	async addProductToCart(cartId, productId) {
		const items = await this.#readFile();
		const index = items.findIndex(c => String(c.id) === String(cartId));
		if (index === -1) return null;

		const cart = items[index];
		const existing = cart.products.find(p => String(p.product) === String(productId));
		if (existing) {
			existing.quantity += 1;
		} else {
			cart.products.push({ product: productId, quantity: 1 });
		}
		items[index] = cart;
		await this.#writeFile(items);
		return cart;
	}
}

module.exports = CartManager;
