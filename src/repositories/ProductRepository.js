const ProductDAO = require('../dao/ProductDAO');

class ProductRepository {
	constructor() {
		this.dao = new ProductDAO();
	}

	async getProducts(filters = {}) {
		const { limit = 10, page = 1, sort, query, isView = false } = filters;
		
		const result = await this.dao.findAll({ limit, page, sort, query });
		
		const { products, totalDocs } = result;
		const totalPages = Math.ceil(totalDocs / limit);
		const hasPrevPage = page > 1;
		const hasNextPage = page < totalPages;
		const prevPage = hasPrevPage ? page - 1 : null;
		const nextPage = hasNextPage ? page + 1 : null;

		const endpoint = isView ? '/products' : '/api/products';
		const baseUrl = process.env.BASE_URL || '';
		const queryParams = new URLSearchParams();
		if (limit !== 10) queryParams.set('limit', limit);
		if (query) queryParams.set('query', query);
		if (sort) queryParams.set('sort', sort);
		
		const prevLink = hasPrevPage 
			? `${baseUrl}${endpoint}?${queryParams.toString()}&page=${prevPage}`
			: null;
		const nextLink = hasNextPage
			? `${baseUrl}${endpoint}?${queryParams.toString()}&page=${nextPage}`
			: null;

		return {
			status: 'success',
			payload: products,
			totalPages,
			prevPage,
			nextPage,
			page: parseInt(page),
			hasPrevPage,
			hasNextPage,
			prevLink,
			nextLink
		};
	}

	async getProductById(id) {
		return await this.dao.findById(id);
	}

	async addProduct(productData) {
		// Validar campos requeridos
		const required = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
		for (const key of required) {
			if (productData[key] === undefined) {
				const err = new Error(`Campo requerido faltante: ${key}`);
				err.status = 400;
				throw err;
			}
		}

		// Verificar si el código ya existe
		const existing = await this.dao.findByCode(productData.code);
		if (existing) {
			const err = new Error('El code del producto ya existe');
			err.status = 400;
			throw err;
		}

		const product = {
			title: String(productData.title),
			description: String(productData.description),
			code: String(productData.code),
			price: Number(productData.price),
			status: Boolean(productData.status),
			stock: Number(productData.stock),
			category: String(productData.category),
			thumbnails: Array.isArray(productData.thumbnails) 
				? productData.thumbnails.map(String) 
				: []
		};

		return await this.dao.create(product);
	}

	async updateProduct(id, updates) {
		const allowed = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
		const updateData = {};

		for (const key of Object.keys(updates)) {
			if (!allowed.includes(key)) continue;
			if (key === 'thumbnails') {
				updateData[key] = Array.isArray(updates[key]) ? updates[key].map(String) : updates[key];
			} else if (['price', 'stock'].includes(key)) {
				updateData[key] = Number(updates[key]);
			} else if (key === 'status') {
				updateData[key] = Boolean(updates[key]);
			} else {
				updateData[key] = String(updates[key]);
			}
		}

		return await this.dao.update(id, updateData);
	}

	async deleteProduct(id) {
		return await this.dao.delete(id);
	}

	async updateStock(id, quantity) {
		return await this.dao.updateStock(id, quantity);
	}
}

module.exports = ProductRepository;
