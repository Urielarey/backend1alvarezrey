const Product = require('../models/Product');

class ProductDAO {
	async findAll(filters = {}) {
		const { limit = 10, page = 1, sort, query } = filters;
		
		const filter = {};
		if (query) {
			if (query === 'available' || query === 'disponible') {
				filter.status = true;
				filter.stock = { $gt: 0 };
			} else if (query === 'unavailable' || query === 'no-disponible') {
				filter.$or = [
					{ status: false },
					{ stock: 0 }
				];
			} else {
				filter.category = { $regex: query, $options: 'i' };
			}
		}

		let sortOption = {};
		if (sort === 'asc') {
			sortOption = { price: 1 };
		} else if (sort === 'desc') {
			sortOption = { price: -1 };
		}

		const skip = (page - 1) * limit;
		
		const products = await Product.find(filter)
			.sort(sortOption)
			.skip(skip)
			.limit(limit)
			.lean();

		const totalDocs = await Product.countDocuments(filter);
		
		return {
			products,
			totalDocs,
			limit,
			page,
			sortOption
		};
	}

	async findById(id) {
		try {
			const product = await Product.findById(id).lean();
			return product;
		} catch (error) {
			return null;
		}
	}

	async create(productData) {
		const product = new Product(productData);
		await product.save();
		return product.toObject();
	}

	async update(id, updateData) {
		const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();
		return updated;
	}

	async delete(id) {
		const result = await Product.findByIdAndDelete(id);
		return result !== null;
	}

	async findByCode(code) {
		try {
			const product = await Product.findOne({ code }).lean();
			return product;
		} catch (error) {
			return null;
		}
	}

	async updateStock(id, quantity) {
		const product = await Product.findById(id);
		if (!product) return null;
		
		product.stock += quantity;
		await product.save();
		return product.toObject();
	}
}

module.exports = ProductDAO;
