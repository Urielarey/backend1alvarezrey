const { Router } = require('express');
const { requireAdmin, authenticate } = require('../middlewares/authorization');
const {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct
} = require('../controllers/products.controller');

const router = Router();

// GET /api/products/ - Listar productos (público)
router.get('/', getProducts);

// GET /api/products/:pid - Obtener producto por ID (público)
router.get('/:pid', getProductById);

// POST /api/products/ - Crear producto (solo admin)
router.post('/', requireAdmin, createProduct);

// PUT /api/products/:pid - Actualizar producto (solo admin)
router.put('/:pid', requireAdmin, updateProduct);

// DELETE /api/products/:pid - Eliminar producto (solo admin)
router.delete('/:pid', requireAdmin, deleteProduct);

module.exports = router;
