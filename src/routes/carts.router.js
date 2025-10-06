const { Router } = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const cartsPath = path.join(__dirname, '..', 'data', 'carts.json');
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const cartManager = new CartManager(cartsPath);
const productManager = new ProductManager(productsPath);

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
		res.json(cart.products || []);
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

module.exports = router;
