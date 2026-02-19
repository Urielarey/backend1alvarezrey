const TicketDAO = require('../dao/TicketDAO');

class TicketRepository {
	constructor() {
		this.dao = new TicketDAO();
	}

	async createTicket(ticketData) {
		return await this.dao.create(ticketData);
	}

	async getTicketById(id) {
		return await this.dao.findById(id);
	}

	async getTicketsByPurchaser(purchaserId) {
		return await this.dao.findByPurchaser(purchaserId);
	}
}

module.exports = TicketRepository;
