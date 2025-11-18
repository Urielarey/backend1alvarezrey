const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// GET /
router.get('/', async (req, res, next) => {
	try {
		const result = await productManager.getProducts({ limit: 100, page: 1 });
		res.render('home', { products: result.payload });
	} catch (err) {
		next(err);
	}
});

// GET /realtimeproducts
router.get('/realtimeproducts', async (req, res, next) => {
	try {
		const result = await productManager.getProducts({ limit: 100, page: 1 });
		res.render('realTimeProducts', { products: result.payload });
	} catch (err) {
		next(err);
	}
});

// GET /products
router.get('/products', async (req, res, next) => {
	try {
		const { limit, page, sort, query } = req.query;
		const filters = {
			limit: limit ? parseInt(limit) : 10,
			page: page ? parseInt(page) : 1,
			sort: sort || null,
			query: query || null
		};
		filters.isView = true;
		const result = await productManager.getProducts(filters);
		// Agregar los query params al objeto para la vista
		result.limit = filters.limit;
		result.sort = filters.sort;
		result.query = filters.query;
		res.render('products', result);
	} catch (err) {
		next(err);
	}
});

// GET /products/:pid
router.get('/products/:pid', async (req, res, next) => {
	try {
		const { pid } = req.params;
		const product = await productManager.getProductById(pid);
		if (!product) {
			return res.status(404).render('error', { message: 'Producto no encontrado' });
		}
		res.render('productDetail', { product });
	} catch (err) {
		next(err);
	}
});

// GET /carts/:cid
router.get('/carts/:cid', async (req, res, next) => {
	try {
		const { cid } = req.params;
		const cart = await cartManager.getCartById(cid);
		if (!cart) {
			return res.status(404).render('error', { message: 'Carrito no encontrado' });
		}
		res.render('cart', { cart });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

