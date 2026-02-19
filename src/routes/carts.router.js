const { Router } = require('express');
const { requireUser, authenticate } = require('../middlewares/authorization');
const {
	createCart,
	getCartById,
	addProductToCart,
	deleteProductFromCart,
	updateCart,
	updateProductQuantity,
	deleteAllProductsFromCart,
	purchaseCart
} = require('../controllers/carts.controller');

const router = Router();

// POST /api/carts/ - Crear carrito
router.post('/', createCart);

// GET /api/carts/:cid - Obtener carrito por ID
router.get('/:cid', getCartById);

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito (solo usuarios)
router.post('/:cid/product/:pid', requireUser, addProductToCart);

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete('/:cid/products/:pid', deleteProductFromCart);

// PUT /api/carts/:cid - Actualizar carrito
router.put('/:cid', updateCart);

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de producto
router.put('/:cid/products/:pid', updateProductQuantity);

// DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', deleteAllProductsFromCart);

// POST /api/carts/:cid/purchase - Procesar compra (requiere autenticación)
router.post('/:cid/purchase', authenticate, purchaseCart);

module.exports = router;
