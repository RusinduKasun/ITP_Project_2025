import Income from "../../models/Finance/Income.js";
import mongoose from "mongoose";

// Helper function to generate the next income ID
const getNextIncomeId = async () => {
  const lastIncome = await Income.findOne().sort({ incomeId: -1 });
  if (!lastIncome || !lastIncome.incomeId) {
    return "INC001";
  }

  // Check if incomeId follows the INC### format
  const match = lastIncome.incomeId.match(/INC(\d+)/);
  if (!match) {
    return "INC001";
  }

  const lastNumber = parseInt(match[1]);
  const nextNumber = lastNumber + 1;
  return `INC${nextNumber.toString().padStart(3, "0")}`;
};

// Get all income entries
export const getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, product } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.incomeDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (product && product !== "all") {
      query.productType = product;
    }

    const incomes = await Income.find(query).sort({ createdAt: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get income by ID
export const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new income entry
export const createIncome = async (req, res) => {
  try {
    const nextIncomeId = await getNextIncomeId();

    const incomeData = {
      ...req.body,
      incomeId: nextIncomeId,
    };

    const income = new Income(incomeData);
    const savedIncome = await income.save();
    res.status(201).json(savedIncome);
  } catch (err) {
    res.status(400).json({
      error: err.message,
      details: err.errors ? Object.values(err.errors).map((e) => e.message) : [],
    });
  }
};

// Update income
export const updateIncome = async (req, res) => {
  try {
    const updated = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Income record not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: err.message,
      details: err.errors ? Object.values(err.errors).map((e) => e.message) : [],
    });
  }
};

// Delete income
export const deleteIncome = async (req, res) => {
  try {
    const deleted = await Income.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Income record not found" });
    }
    res.json({ message: "Income record deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get income summary by category
export const getIncomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
      {
        $group: {
          _id: { category: "$category", productType: "$productType" },
          totalAmount: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          products: {
            $push: {
              productType: "$_id.productType",
              totalAmount: "$totalAmount",
              totalQuantity: "$totalQuantity",
              count: "$count",
            },
          },
          categoryTotal: { $sum: "$totalAmount" },
        },
      },
      { $sort: { categoryTotal: -1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily income
export const getDailyIncome = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const dailyIncome = await Income.aggregate([
      {
        $match: {
          incomeDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$incomeDate" } },
          totalAmount: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(dailyIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
