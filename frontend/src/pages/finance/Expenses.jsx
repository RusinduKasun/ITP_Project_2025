// src/pages/finance/Expenses.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Expenses.css";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Utilities",
  "Maintenance",
  "Other",
];

const PRODUCT_TYPES = ["woodapple", "jackfruit", "durian", "banana", "other"];

const generateNextExpenseID = (lastID) => {
  if (!lastID) return "EXP001";
  const num = parseInt(lastID.slice(3)) + 1;
  return `EXP${num.toString().padStart(3, "0")}`;
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [lastExpenseID, setLastExpenseID] = useState("EXP000");
  const [formData, setFormData] = useState({
    expenseID: "",
    description: "",
    amount: "",
    category: "",
    productType: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/expenses");
      setExpenses(res.data);

      const maxID = res.data.reduce((max, exp) => {
        if (!exp.expenseID) return max;
        const num = parseInt(exp.expenseID.slice(3));
        return num > max ? num : max;
      }, 0);

      setLastExpenseID(`EXP${maxID.toString().padStart(3, "0")}`);
      setError(null);
    } catch (err) {
      setError("Failed to fetch expenses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validate form before submit
  const validateForm = () => {
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    if (!formData.category && !formData.productType) {
      setError("Please select at least a Category or Product Type");
      return false;
    }
    return true; // ✅ both is okay now
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expenseData = { ...formData };

      if (!editingId) {
        const nextID = generateNextExpenseID(lastExpenseID);
        expenseData.expenseID = nextID;
        setLastExpenseID(nextID);
      }

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/expenses/${editingId}`,
          expenseData
        );
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/expenses", expenseData);
      }

      setFormData({
        expenseID: "",
        description: "",
        amount: "",
        category: "",
        productType: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
      setError(null);

      fetchExpenses();
    } catch (err) {
      let errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error saving expense. Please try again.";

      if (
        errorMessage.includes("category or product type")
      ) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }

      console.error("Error saving expense:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (expense) => {
    setError(null);
    setFormData({
      expenseID: expense.expenseID,
      description: expense.description,
      amount: expense.amount,
      category: expense.category || "",
      productType: expense.productType || "",
      expenseDate: expense.expenseDate.split("T")[0],
    });
    setEditingId(expense._id);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      setError("Error deleting expense. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory =
      selectedCategory === "All" ||
      exp.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDescription = exp.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDescription;
  });

  const totalAmount = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="expenses-container">
      <h2>💰 Expenses Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="expense-id-display">
          Expense ID:{" "}
          {editingId
            ? formData.expenseID
            : generateNextExpenseID(lastExpenseID)}
        </div>

        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
          required
        />

        <input
          type="number"
          placeholder="Amount (Rs)"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: Number(e.target.value) })
          }
          min="0"
          step="0.01"
          disabled={loading}
          required
        />

        {/* Category dropdown */}
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value,
            })
          }
          disabled={loading}
        >
          <option value="">Choose Category</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Product Type dropdown */}
        <select
          value={formData.productType}
          onChange={(e) =>
            setFormData({
              ...formData,
              productType: e.target.value,
            })
          }
          disabled={loading}
        >
          <option value="">Choose Product Type</option>
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={formData.expenseDate}
          onChange={(e) =>
            setFormData({ ...formData, expenseDate: e.target.value })
          }
          disabled={loading}
          required
        />

        <p className="helper-text">
          Select a <b>Category</b>, a <b>Product Type</b>, or <b>both</b> (at least one is required).
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          No expenses found. Add your first expense using the form above.
        </div>
      ) : (
        <>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Description</th>
                <th>Amount (Rs)</th>
                <th>Category</th>
                <th>Product Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.expenseID}</td>
                  <td>{exp.description}</td>
                  <td>Rs {exp.amount.toLocaleString()}</td>
                  <td>{exp.category || "-"}</td>
                  <td>{exp.productType || "-"}</td>
                  <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(exp)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(exp._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="total-amount">
            Total Expenses: Rs {totalAmount.toLocaleString()}
          </h3>
        </>
      )}
    </div>
  );
};

export default Expenses;
