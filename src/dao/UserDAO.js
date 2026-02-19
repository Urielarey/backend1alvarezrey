const User = require('../models/User');

class UserDAO {
	async findAll() {
		const users = await User.find().select('-password').populate('cart').lean();
		return users;
	}

	async findById(id) {
		try {
			const user = await User.findById(id).select('-password').populate('cart').lean();
			return user;
		} catch (error) {
			return null;
		}
	}

	async findByIdWithPassword(id) {
		try {
			const user = await User.findById(id).populate('cart');
			return user;
		} catch (error) {
			return null;
		}
	}

	async findByEmail(email) {
		try {
			const user = await User.findOne({ email }).populate('cart');
			return user;
		} catch (error) {
			return null;
		}
	}

	async create(userData) {
		const user = new User(userData);
		await user.save();
		return user;
	}

	async update(id, updateData) {
		const updated = await User.findByIdAndUpdate(id, updateData, { new: true })
			.select('-password')
			.populate('cart')
			.lean();
		return updated;
	}

	async updateWithPassword(id, updateData) {
		const user = await User.findById(id);
		if (!user) return null;
		
		Object.assign(user, updateData);
		await user.save();
		
		return await User.findById(id).select('-password').populate('cart').lean();
	}

	async delete(id) {
		const result = await User.findByIdAndDelete(id);
		return result !== null;
	}

	async findByResetToken(token) {
		try {
			const user = await User.findOne({ 
				resetPasswordToken: token,
				resetPasswordExpires: { $gt: Date.now() }
			});
			return user;
		} catch (error) {
			return null;
		}
	}
}

module.exports = UserDAO;
