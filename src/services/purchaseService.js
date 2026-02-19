const CartRepository = require('../repositories/CartRepository');
const ProductRepository = require('../repositories/ProductRepository');
const TicketRepository = require('../repositories/TicketRepository');

class PurchaseService {
	constructor() {
		this.cartRepository = new CartRepository();
		this.productRepository = new ProductRepository();
		this.ticketRepository = new TicketRepository();
	}

	async processPurchase(cartId, userId) {
		const cart = await this.cartRepository.getCartById(cartId);
		
		if (!cart) {
			const err = new Error('Carrito no encontrado');
			err.status = 404;
			throw err;
		}

		if (!cart.products || cart.products.length === 0) {
			const err = new Error('El carrito está vacío');
			err.status = 400;
			throw err;
		}

		const productsToPurchase = [];
		const productsNotPurchased = [];
		let totalAmount = 0;

		// Verificar stock y calcular total
		for (const item of cart.products) {
			const product = item.product;
			const requestedQuantity = item.quantity;

			if (!product) {
				productsNotPurchased.push({
					productId: item.product?._id || item.product,
					reason: 'Producto no encontrado'
				});
				continue;
			}

			if (product.stock < requestedQuantity) {
				productsNotPurchased.push({
					productId: product._id,
					productTitle: product.title,
					requestedQuantity,
					availableStock: product.stock,
					reason: 'Stock insuficiente'
				});
				continue;
			}

			// Producto disponible, agregar a la compra
			const productPrice = product.price * requestedQuantity;
			totalAmount += productPrice;

			productsToPurchase.push({
				product: product._id,
				quantity: requestedQuantity,
				price: product.price
			});
		}

		// Si no hay productos para comprar, retornar error
		if (productsToPurchase.length === 0) {
			const err = new Error('No hay productos disponibles para comprar');
			err.status = 400;
			err.details = productsNotPurchased;
			throw err;
		}

		// Crear ticket solo con los productos disponibles
		const ticket = await this.ticketRepository.createTicket({
			amount: totalAmount,
			purchaser: userId,
			products: productsToPurchase
		});

		// Actualizar stock de productos comprados
		for (const item of productsToPurchase) {
			await this.productRepository.updateStock(item.product, -item.quantity);
		}

		// Actualizar carrito: remover productos comprados, mantener los no comprados
		const remainingProducts = cart.products
			.filter(item => {
				return productsNotPurchased.some(
					notPurchased => notPurchased.productId.toString() === 
					(item.product?._id || item.product)?.toString()
				);
			})
			.map(item => ({
				product: item.product?._id || item.product,
				quantity: item.quantity
			}));

		await this.cartRepository.updateCart(cartId, remainingProducts);

		return {
			ticket,
			productsNotPurchased: productsNotPurchased.length > 0 ? productsNotPurchased : undefined
		};
	}
}

module.exports = PurchaseService;
