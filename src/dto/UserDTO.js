class UserDTO {
	constructor(user) {
		this.id = user._id || user.id;
		this.first_name = user.first_name;
		this.last_name = user.last_name;
		this.email = user.email;
		this.age = user.age;
		this.role = user.role;
		this.cart = user.cart;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
	}

	static fromUser(user) {
		return new UserDTO(user);
	}

	toJSON() {
		return {
			id: this.id,
			first_name: this.first_name,
			last_name: this.last_name,
			email: this.email,
			age: this.age,
			role: this.role,
			cart: this.cart,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt
		};
	}
}

module.exports = UserDTO;
