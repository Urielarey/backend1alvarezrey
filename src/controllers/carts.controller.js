const CartRepository = require('../repositories/CartRepository');
const ProductRepository = require('../repositories/ProductRepository');
const PurchaseService = require('../services/purchaseService');

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const purchaseService = new PurchaseService();

// POST /api/carts/
const createCart = async (req, res, next) => {
	try {
		const cart = await cartRepository.createCart();
		res.status(201).json(cart);
	} catch (err) {
		next(err);
	}
};

// GET /api/carts/:cid
const getCartById = async (req, res, next) => {
	try {
		const { cid } = req.params;
		const cart = await cartRepository.getCartById(cid);
		if (!cart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(cart);
	} catch (err) {
		next(err);
	}
};

// POST /api/carts/:cid/product/:pid
const addProductToCart = async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const product = await productRepository.getProductById(pid);
		if (!product) {
			return res.status(404).json({ error: 'Producto no existe' });
		}
		const updatedCart = await cartRepository.addProductToCart(cid, pid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.status(201).json(updatedCart);
	} catch (err) {
		next(err);
	}
};

// DELETE /api/carts/:cid/products/:pid
const deleteProductFromCart = async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const updatedCart = await cartRepository.deleteProductFromCart(cid, pid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
};

// PUT /api/carts/:cid
const updateCart = async (req, res, next) => {
	try {
		const { cid } = req.params;
		const { products } = req.body;
		if (!Array.isArray(products)) {
			return res.status(400).json({ error: 'products debe ser un arreglo' });
		}
		const updatedCart = await cartRepository.updateCart(cid, products);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
};

// PUT /api/carts/:cid/products/:pid
const updateProductQuantity = async (req, res, next) => {
	try {
		const { cid, pid } = req.params;
		const { quantity } = req.body;
		if (quantity === undefined || quantity < 1) {
			return res.status(400).json({ error: 'quantity debe ser un número mayor a 0' });
		}
		const updatedCart = await cartRepository.updateProductQuantity(cid, pid, quantity);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
};

// DELETE /api/carts/:cid
const deleteAllProductsFromCart = async (req, res, next) => {
	try {
		const { cid } = req.params;
		const updatedCart = await cartRepository.deleteAllProductsFromCart(cid);
		if (!updatedCart) {
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		res.json(updatedCart);
	} catch (err) {
		next(err);
	}
};

// POST /api/carts/:cid/purchase - Procesar compra
const purchaseCart = async (req, res, next) => {
	try {
		const { cid } = req.params;
		const userId = req.user._id.toString();
		
		const result = await purchaseService.processPurchase(cid, userId);
		
		res.json({
			status: 'success',
			message: 'Compra procesada exitosamente',
			payload: {
				ticket: result.ticket,
				productsNotPurchased: result.productsNotPurchased
			}
		});
	} catch (err) {
		if (err.status === 400 || err.status === 404) {
			return res.status(err.status).json({
				status: 'error',
				message: err.message,
				details: err.details
			});
		}
		next(err);
	}
};

module.exports = {
	createCart,
	getCartById,
	addProductToCart,
	deleteProductFromCart,
	updateCart,
	updateProductQuantity,
	deleteAllProductsFromCart,
	purchaseCart
};
