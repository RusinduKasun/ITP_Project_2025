const User = require("../Model-nadula/producOrderModel");

// Get all users/cart items
const getAllUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find();
	} catch (err) {
		return res.status(500).json({ message: "Server Error", error: err.message });
	}

	if (!users || users.length === 0) {
		return res.status(404).json({ message: "No users/cart items found" });
	}

	return res.status(200).json({ users });
};

// Add new user/cart item
const addUsers = async (req, res, next) => {
	const { name, gmail, age, address, quantity } = req.body;

	let user;
	try {
		user = new User({ name, gmail, age, address, quantity });
		await user.save();
	} catch (err) {
		return res.status(500).json({ message: "Server Error", error: err.message });
	}

	if (!user) {
		return res.status(404).json({ message: "Unable to add user/cart item" });
	}
	return res.status(200).json({ user });
};

// Get user/cart item by ID
const getById = async (req, res, next) => {
	const id = req.params.id;

	let user;
	try {
		user = await User.findById(id);
	} catch (err) {
		return res.status(500).json({ message: "Server Error", error: err.message });
	}

	if (!user) {
		return res.status(404).json({ message: "User/cart item not found" });
	}
	return res.status(200).json({ user });
};

// Update user/cart item
const updateUser = async (req, res, next) => {
	const id = req.params.id;
	const { name, gmail, age, address, quantity } = req.body;

	let user;
	try {
		user = await User.findByIdAndUpdate(
			id,
			{ name, gmail, age, address, quantity },
			{ new: true }
		);
	} catch (err) {
		return res.status(500).json({ message: "Server Error", error: err.message });
	}

	if (!user) {
		return res.status(404).json({ message: "Unable to update user/cart item" });
	}
	return res.status(200).json({ user });
};

// Delete user/cart item
const deleteUser = async (req, res, next) => {
	const id = req.params.id;

	let user;
	try {
		user = await User.findByIdAndDelete(id);
	} catch (err) {
		return res.status(500).json({ message: "Server Error", error: err.message });
	}

	if (!user) {
		return res.status(404).json({ message: "Unable to delete user/cart item" });
	}
	return res.status(200).json({ user });
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
