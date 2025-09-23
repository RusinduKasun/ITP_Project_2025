import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    incomeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Jackfruit Products",
        "Wood Apple Products",
        "Durian Products",
        "Banana Products",
        "Other",
      ],
      required: true,
    },
    productType: {
      type: String,
      enum: ["woodapple", "jackfruit", "durian", "banana", "other"],
      required: true,
    },
    variant: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    incomeDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Online Payment", "Other"],
      default: "Cash",
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual for total amount
incomeSchema.virtual("amount").get(function () {
  return this.quantity * this.unitPrice;
});

const Income = mongoose.model("Income", incomeSchema);
export default Income;
