const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const dataPath = path.join(__dirname, '..', 'data', 'products.json');
const productManager = new ProductManager(dataPath);

// GET /api/products/
router.get('/', async (req, res, next) => {
	try {
		const products = await productManager.getProducts();
		res.json(products);
	} catch (err) {
		next(err);
	}
});

// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
	try {
		const { pid } = req.params;
		const product = await productManager.getProductById(pid);
		if (!product) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		res.json(product);
	} catch (err) {
		next(err);
	}
});

// POST /api/products/
router.post('/', async (req, res, next) => {
	try {
		const { title, description, code, price, status, stock, category, thumbnails } = req.body;
		const newProduct = await productManager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
		
		// Emitir evento de Socket.io para actualizar productos en tiempo real
		const io = req.app.get('io');
		if (io) {
			const products = await productManager.getProducts();
			io.emit('updateProducts', products);
		}
		
		res.status(201).json(newProduct);
	} catch (err) {
		next(err);
	}
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res, next) => {
	try {
		const { pid } = req.params;
		const updates = { ...req.body };
		delete updates.id; // No permitir actualizar id
		const updated = await productManager.updateProduct(pid, updates);
		if (!updated) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
	try {
		const { pid } = req.params;
		const removed = await productManager.deleteProduct(pid);
		if (!removed) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		
		// Emitir evento de Socket.io para actualizar productos en tiempo real
		const io = req.app.get('io');
		if (io) {
			const products = await productManager.getProducts();
			io.emit('updateProducts', products);
		}
		
		res.json({ status: 'deleted' });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
