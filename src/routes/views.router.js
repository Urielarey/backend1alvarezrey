const { Router } = require('express');
const ProductRepository = require('../repositories/ProductRepository');
const CartRepository = require('../repositories/CartRepository');

const router = Router();
const productRepository = new ProductRepository();
const cartRepository = new CartRepository();

// GET /
router.get('/', async (req, res, next) => {
	try {
		const result = await productRepository.getProducts({ limit: 100, page: 1 });
		res.render('home', { products: result.payload });
	} catch (err) {
		next(err);
	}
});

// GET /realtimeproducts
router.get('/realtimeproducts', async (req, res, next) => {
	try {
		const result = await productRepository.getProducts({ limit: 100, page: 1 });
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
			query: query || null,
			isView: true
		};
		const result = await productRepository.getProducts(filters);
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
		const product = await productRepository.getProductById(pid);
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
		const cart = await cartRepository.getCartById(cid);
		if (!cart) {
			return res.status(404).render('error', { message: 'Carrito no encontrado' });
		}
		res.render('cart', { cart });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
