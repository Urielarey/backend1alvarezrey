const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const dataPath = path.join(__dirname, '..', 'data', 'products.json');
const productManager = new ProductManager(dataPath);

// GET /
router.get('/', async (req, res, next) => {
	try {
		const products = await productManager.getProducts();
		res.render('home', { products });
	} catch (err) {
		next(err);
	}
});

// GET /realtimeproducts
router.get('/realtimeproducts', async (req, res, next) => {
	try {
		const products = await productManager.getProducts();
		res.render('realTimeProducts', { products });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

