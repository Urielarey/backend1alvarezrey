const { Router } = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// POST /api/carts/
router.post('/', async (req, res, next) => {
	try {
		const cart = await cartManager.createCart();
		res.status(201).json(cart);
	} catch (err) {
		next(err);
	}
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res, next) => {
	try {
		const { cid } = req.params;
		const cart = await cartManager.getCartById(cid);
		if (!cart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(cart);
	} catch (err) {
		next(err);
	}
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const product = await productManager.getProductById(pid);
		if (!product) {
			return res.status(404).json({ error: 'Producto no existe' });
		}
		const updatedCart = await cartManager.addProductToCart(cid, pid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.status(201).json(updatedCart);
	} catch (err) {
		next(err);
	}
});

// DELETE /api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const updatedCart = await cartManager.deleteProductFromCart(cid, pid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
});

// PUT /api/carts/:cid
router.put('/:cid', async (req, res, next) => {
	try {
		const { cid } = req.params;
		const { products } = req.body;
		if (!Array.isArray(products)) {
			return res.status(400).json({ error: 'products debe ser un arreglo' });
		}
		const updatedCart = await cartManager.updateCart(cid, products);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
});

// PUT /api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const { quantity } = req.body;
		if (quantity === undefined || quantity < 1) {
			return res.status(400).json({ error: 'quantity debe ser un número mayor a 0' });
		}
		const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
});

// DELETE /api/carts/:cid
router.delete('/:cid', async (req, res, next) => {
	try {
		const { cid } = req.params;
		const updatedCart = await cartManager.deleteAllProductsFromCart(cid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
