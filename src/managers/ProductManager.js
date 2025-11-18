const Product = require('../models/Product');

class ProductManager {
	async getProducts(filters = {}) {
		const { limit = 10, page = 1, sort, query } = filters;
		
		// Construir filtro de búsqueda
		const filter = {};
		if (query) {
			// Buscar por categoría o disponibilidad
			if (query === 'available' || query === 'disponible') {
				filter.status = true;
				filter.stock = { $gt: 0 };
			} else if (query === 'unavailable' || query === 'no-disponible') {
				filter.$or = [
					{ status: false },
					{ stock: 0 }
				];
			} else {
				// Buscar por categoría
				filter.category = { $regex: query, $options: 'i' };
			}
		}

		// Construir ordenamiento
		let sortOption = {};
		if (sort === 'asc') {
			sortOption = { price: 1 };
		} else if (sort === 'desc') {
			sortOption = { price: -1 };
		}

		// Calcular paginación
		const skip = (page - 1) * limit;
		
		// Obtener productos con paginación
		const products = await Product.find(filter)
			.sort(sortOption)
			.skip(skip)
			.limit(limit)
			.lean();

		// Obtener total de documentos
		const totalDocs = await Product.countDocuments(filter);
		const totalPages = Math.ceil(totalDocs / limit);

		// Construir respuesta con paginación
		const hasPrevPage = page > 1;
		const hasNextPage = page < totalPages;
		const prevPage = hasPrevPage ? page - 1 : null;
		const nextPage = hasNextPage ? page + 1 : null;

		// Construir links (para vistas usar /products, para API usar /api/products)
		const isView = filters.isView || false;
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
		try {
			const product = await Product.findById(id).lean();
			return product;
		} catch (error) {
			return null;
		}
	}

	async addProduct(product) {
		const required = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
		for (const key of required) {
			if (product[key] === undefined) {
				const err = new Error(`Campo requerido faltante: ${key}`);
				err.status = 400;
				throw err;
			}
		}

		// Verificar si el código ya existe
		const existing = await Product.findOne({ code: product.code });
		if (existing) {
			const err = new Error('El code del producto ya existe');
			err.status = 400;
			throw err;
		}

		const newProduct = new Product({
			title: String(product.title),
			description: String(product.description),
			code: String(product.code),
			price: Number(product.price),
			status: Boolean(product.status),
			stock: Number(product.stock),
			category: String(product.category),
			thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails.map(String) : []
		});

		await newProduct.save();
		return newProduct.toObject();
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

		const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();
		return updated;
	}

	async deleteProduct(id) {
		const result = await Product.findByIdAndDelete(id);
		return result !== null;
	}
}

module.exports = ProductManager;
