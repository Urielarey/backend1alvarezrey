const Ticket = require('../models/Ticket');

class TicketDAO {
	async create(ticketData) {
		const ticket = new Ticket(ticketData);
		await ticket.save();
		return ticket.toObject();
	}

	async findById(id) {
		try {
			const ticket = await Ticket.findById(id)
				.populate('purchaser', '-password')
				.populate('products.product')
				.lean();
			return ticket;
		} catch (error) {
			return null;
		}
	}

	async findByPurchaser(purchaserId) {
		try {
			const tickets = await Ticket.find({ purchaser: purchaserId })
				.populate('products.product')
				.sort({ purchase_datetime: -1 })
				.lean();
			return tickets;
		} catch (error) {
			return [];
		}
	}
}

module.exports = TicketDAO;
