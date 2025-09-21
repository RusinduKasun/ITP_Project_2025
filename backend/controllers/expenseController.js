import Expense from "../models/Expense.js";

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, product } = req.query;
    let query = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      query.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add product filter if provided and not 'all'
    if (product && product !== 'all') {
      query.productType = product;
    }

    console.log('Expense Query:', query); // Debug log

    const expenses = await Expense.find(query)
      .populate("financeManager")
      .sort({ date: -1 });
    
    console.log(`Found ${expenses.length} expense records`); // Debug log
    res.json(expenses);
  } catch (err) {
    console.error("Error in getExpenses:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("financeManager");
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new expense
export const createExpense = async (req, res) => {
  try {
    // Remove financeManager if it's an empty string
    const expenseData = { ...req.body };
    if (expenseData.financeManager === "") {
      delete expenseData.financeManager;
    }
    
    const expense = new Expense(expenseData);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
