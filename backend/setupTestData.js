import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import ProductConfig from './models/ProductConfig.js';

dotenv.config();

const sampleData = {
  productConfigs: [
    {
      productType: "jackfruit",
      variants: [
        { name: "raw", unitPrice: 250, unit: "kg" },
        { name: "chips", unitPrice: 800, unit: "packet" },
        { name: "dried", unitPrice: 1200, unit: "kg" },
        { name: "paste", unitPrice: 600, unit: "kg" }
      ]
    },
    {
      productType: "woodapple",
      variants: [
        { name: "raw", unitPrice: 180, unit: "kg" },
        { name: "cordial", unitPrice: 450, unit: "bottle" },
        { name: "jam", unitPrice: 350, unit: "bottle" }
      ]
    },
    {
      productType: "durian",
      variants: [
        { name: "raw", unitPrice: 900, unit: "piece" },
        { name: "paste", unitPrice: 1500, unit: "kg" }
      ]
    },
    {
      productType: "banana",
      variants: [
        { name: "raw", unitPrice: 120, unit: "kg" },
        { name: "chips", unitPrice: 350, unit: "packet" }
      ]
    }
  ],
  incomes: [
    {
      description: "Jackfruit Sale",
      category: "Jackfruit Products",
      productType: "jackfruit",
      quantity: 100,
      unitPrice: 250,
      incomeDate: "2025-09-01"
    },
    {
      description: "Wood Apple Sale",
      category: "Wood Apple Products",
      productType: "woodapple",
      quantity: 150,
      unitPrice: 180,
      incomeDate: "2025-09-05"
    }
  ],
  expenses: [
    {
      description: "Raw Jackfruit Purchase",
      amount: 15000,
      category: "Food",
      productType: "jackfruit",
      expenseDate: "2025-09-01"
    },
    {
      description: "Raw Wood Apple Purchase",
      amount: 12000,
      category: "Food",
      productType: "woodapple",
      expenseDate: "2025-09-05"
    },
    {
      description: "Jackfruit Processing Cost",
      amount: 5000,
      category: "Food",
      productType: "jackfruit",
      expenseDate: "2025-09-02"
    }
  ]
};

async function setupTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Income.deleteMany({});
    await Expense.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    await Income.insertMany(sampleData.incomes);
    await Expense.insertMany(sampleData.expenses);
    console.log('Inserted sample data');

    console.log('Test data setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTestData();