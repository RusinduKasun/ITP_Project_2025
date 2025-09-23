import User from "../../models/Customer/producOrderModel.js";

// Get all users/cart items
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users/cart items found" });
    }
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add new user/cart item
export const addUsers = async (req, res) => {
  const { name, gmail, age, address, quantity } = req.body;
  try {
    const user = new User({ name, gmail, age, address, quantity });
    await user.save();
    if (!user) {
      return res.status(404).json({ message: "Unable to add user/cart item" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get user/cart item by ID
export const getById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User/cart item not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update user/cart item
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, gmail, age, address, quantity } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, gmail, age, address, quantity },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Unable to update user/cart item" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete user/cart item
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Unable to delete user/cart item" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


