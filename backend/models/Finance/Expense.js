// backend/models/Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    financeManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Utilities",
        "Maintenance",
        "Other",
      ],
    },
    productType: {
      type: String,
      enum: ["woodapple", "jackfruit", "durian", "banana", "other"],
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Validation to ensure at least one field is provided
expenseSchema.pre("validate", function (next) {
  // Convert empty strings to null
  if (this.category === "") this.category = null;
  if (this.productType === "") this.productType = null;

  // Ensure at least one field is provided
  if (!this.category && !this.productType) {
    return next(new Error("Please provide at least a category or product type"));
  }

  next();
});

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
