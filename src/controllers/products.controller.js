const ProductRepository = require('../repositories/ProductRepository');

const productRepository = new ProductRepository();

// GET /api/products/
const getProducts = async (req, res, next) => {
	try {
		const { limit, page, sort, query } = req.query;
		const filters = {
			limit: limit ? parseInt(limit) : 10,
			page: page ? parseInt(page) : 1,
			sort: sort || null,
			query: query || null
		};
		const result = await productRepository.getProducts(filters);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

// GET /api/products/:pid
const getProductById = async (req, res, next) => {
	try {
		const { pid } = req.params;
		const product = await productRepository.getProductById(pid);
		if (!product) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		res.json(product);
	} catch (err) {
		next(err);
	}
};

// POST /api/products/
const createProduct = async (req, res, next) => {
	try {
		const { title, description, code, price, status, stock, category, thumbnails } = req.body;
		const newProduct = await productRepository.addProduct({ 
			title, 
			description, 
			code, 
			price, 
			status, 
			stock, 
			category, 
			thumbnails 
		});
		
		// Emitir evento de Socket.io para actualizar productos en tiempo real
		const io = req.app.get('io');
		if (io) {
			const result = await productRepository.getProducts({ limit: 100, page: 1 });
			io.emit('updateProducts', result.payload);
		}
		
		res.status(201).json(newProduct);
	} catch (err) {
		next(err);
	}
};

// PUT /api/products/:pid
const updateProduct = async (req, res, next) => {
	try {
		const { pid } = req.params;
		const updates = { ...req.body };
		delete updates.id; // No permitir actualizar id
		const updated = await productRepository.updateProduct(pid, updates);
		if (!updated) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
};

// DELETE /api/products/:pid
const deleteProduct = async (req, res, next) => {
	try {
		const { pid } = req.params;
		const removed = await productRepository.deleteProduct(pid);
		if (!removed) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		
		// Emitir evento de Socket.io para actualizar productos en tiempo real
		const io = req.app.get('io');
		if (io) {
			const result = await productRepository.getProducts({ limit: 100, page: 1 });
			io.emit('updateProducts', result.payload);
		}
		
		res.json({ status: 'deleted' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct
};
