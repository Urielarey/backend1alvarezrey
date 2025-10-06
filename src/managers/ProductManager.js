const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

class ProductManager {
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

	async getProducts() {
		return await this.#readFile();
	}

	async getProductById(id) {
		const items = await this.#readFile();
		return items.find(p => String(p.id) === String(id));
	}

	async addProduct(product) {
		const required = ['title','description','code','price','status','stock','category'];
		for (const key of required) {
			if (product[key] === undefined) {
				const err = new Error(`Campo requerido faltante: ${key}`);
				err.status = 400;
				throw err;
			}
		}

		const items = await this.#readFile();
		if (items.some(p => p.code === product.code)) {
			const err = new Error('El code del producto ya existe');
			err.status = 400;
			throw err;
		}

		const newItem = {
			id: randomUUID(),
			title: String(product.title),
			description: String(product.description),
			code: String(product.code),
			price: Number(product.price),
			status: Boolean(product.status),
			stock: Number(product.stock),
			category: String(product.category),
			thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails.map(String) : []
		};
		items.push(newItem);
		await this.#writeFile(items);
		return newItem;
	}

	async updateProduct(id, updates) {
		const items = await this.#readFile();
		const index = items.findIndex(p => String(p.id) === String(id));
		if (index === -1) return null;

		const current = items[index];
		const allowed = ['title','description','code','price','status','stock','category','thumbnails'];
		for (const key of Object.keys(updates)) {
			if (!allowed.includes(key)) continue;
			if (key === 'thumbnails') {
				items[index][key] = Array.isArray(updates[key]) ? updates[key].map(String) : current[key];
			} else if (['price','stock'].includes(key)) {
				items[index][key] = Number(updates[key]);
			} else if (key === 'status') {
				items[index][key] = Boolean(updates[key]);
			} else {
				items[index][key] = String(updates[key]);
			}
		}
		await this.#writeFile(items);
		return items[index];
	}

	async deleteProduct(id) {
		const items = await this.#readFile();
		const index = items.findIndex(p => String(p.id) === String(id));
		if (index === -1) return false;
		items.splice(index, 1);
		await this.#writeFile(items);
		return true;
	}
}

module.exports = ProductManager;
