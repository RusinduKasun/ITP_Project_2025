import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Income.css";
import Header from "../../components/Finance/layout/Header";
import Sidebar from "../../components/Finance/layout/Sidebar";
import Nav from "../Home/Nav/Nav.jsx";
// Constants
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online Payment", "Other"];

const CATEGORY_MAP = {
  jackfruit: "Jackfruit Products",
  woodapple: "Wood Apple Products",
  durian: "Durian Products",
  banana: "Banana Products",
  other: "Other",
};

const FRUIT_CATEGORIES = Object.values(CATEGORY_MAP);

const Income = () => {
  // State
  const [productConfigs, setProductConfigs] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    incomeId: "INC001", // Will be updated when incomes are loaded
    description: "",
    category: "",
    productType: "",
    variant: "",
    quantity: "",
    unitPrice: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: "",
    incomeDate: new Date().toISOString().split("T")[0],
  });

  // Generate order reference
  const generateOrderRef = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `ORD-${year}${month}${day}-${random}`;
  };

  // Generate auto-incrementing income ID
  const generateIncomeId = () => {
    const maxId = incomes.reduce((max, income) => {
      const id = income.incomeId || income._id;
      const match = id?.match(/INC(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);

    const nextId = maxId + 1;
    return `INC${nextId.toString().padStart(3, "0")}`;
  };

  // Fetch incomes
  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/incomes");
      setIncomes(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch income records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product configs
  const fetchProductConfigs = async () => {
    try {
      console.log("Fetching product configs...");
      const res = await axios.get("http://localhost:5000/api/products/config");
      console.log("Product configs response:", res.data);
      setProductConfigs(res.data);
      console.log("Product configs set successfully");
    } catch (err) {
      console.error("Error fetching product configs:", err);
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchProductConfigs();
  }, []);

  // Update income ID when incomes are loaded
  useEffect(() => {
    if (incomes.length > 0) {
      setFormData(prev => ({
        ...prev,
        incomeId: generateIncomeId()
      }));
    }
  }, [incomes]);

  // Debug form data changes
  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  // ✅ Simulate a customer order and auto-fill form fields
  const simulateCustomerOrder = () => {
    console.log("=== SIMULATE BUTTON CLICKED ===");
    console.log("Product configs length:", productConfigs.length);

    try {
      let randomProduct;
      let randomQuantity = Math.floor(Math.random() * 10) + 1;

      if (!productConfigs.length) {
        console.log("No product configs available, using fallback data");
        // Fallback data with your specific products
        const fallbackProducts = [
          {
            name: "jackfruit",
            category: "Jackfruit Products",
            price: 150.00,
            variants: ["chips", "noodles", "cordial", "rawfruit"]
          },
          {
            name: "woodapple",
            category: "Wood Apple Products",
            price: 120.00,
            variants: ["jam", "juice", "cordial"]
          },
          {
            name: "durian",
            category: "Durian Products",
            price: 200.00,
            variants: ["syrup", "juice", "rawfruit"]
          },
          {
            name: "banana",
            category: "Banana Products",
            price: 80.00,
            variants: ["chips", "juice", "rawfruit"]
          }
        ];

        randomProduct = fallbackProducts[Math.floor(Math.random() * fallbackProducts.length)];
      } else {
        randomProduct = productConfigs[Math.floor(Math.random() * productConfigs.length)];
      }

      console.log("Selected product:", randomProduct);
      console.log("Random quantity:", randomQuantity);

      // Generate new income ID
      const newIncomeId = generateIncomeId();
      console.log("Generated income ID:", newIncomeId);

      // Auto-fill form with simulated order data
      const newFormData = {
        incomeId: newIncomeId,
        description: `Order for ${randomProduct.name}`,
        category: randomProduct.category,
        productType: randomProduct.name,
        variant: randomProduct.variants?.[0] || "Default",
        quantity: randomQuantity,
        unitPrice: randomProduct.price,
        paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
        referenceNumber: generateOrderRef(),
        notes: "Auto-generated customer order",
        incomeDate: new Date().toISOString().split("T")[0],
      };

      console.log("New form data to set:", newFormData);
      setFormData(newFormData);
      console.log("Form data set! Check form fields now.");
      setError(null);
    } catch (error) {
      console.error("Error simulating order:", error);
      setError("Failed to simulate order");
    }
  };

  // Handle form submit (manual add)
  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Form submitted! Check console for details.");
    console.log("=== FORM SUBMIT CLICKED ===");
    console.log("Form data being submitted:", formData);

    if (!formData.description || !formData.category || !formData.productType) {
      console.log("Missing required fields!");
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending data to backend...");

      if (editingId) {
        console.log("Updating existing record:", editingId);
        await axios.put(
          `http://localhost:5000/api/incomes/${editingId}`,
          formData
        );
        setEditingId(null);
      } else {
        console.log("Creating new record...");
        const dataToSend = {
          ...formData,
          referenceNumber: formData.referenceNumber || generateOrderRef(),
        };
        console.log("Data being sent:", dataToSend);
        console.log("Data being sent (JSON):", JSON.stringify(dataToSend, null, 2));

        const response = await axios.post("http://localhost:5000/api/incomes", dataToSend);
        console.log("Backend response:", response.data);
      }
      setFormData({
        incomeId: generateIncomeId(),
        description: "",
        category: "",
        productType: "",
        variant: "",
        quantity: "",
        unitPrice: "",
        paymentMethod: "Cash",
        referenceNumber: "",
        notes: "",
        incomeDate: new Date().toISOString().split("T")[0],
      });
      console.log("Record saved successfully, refreshing income list...");
      fetchIncomes();
    } catch (err) {
      console.error("Error saving income record:", err);
      console.error("Error details:", err.response?.data);
      console.error("Full error response:", err.response);
      console.error("Status code:", err.response?.status);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);

      // Show detailed error in alert for debugging
      alert(`Error: ${err.response?.data?.error || err.message}\nDetails: ${JSON.stringify(err.response?.data?.details || [])}`);

      setError(`Error saving income record: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (income) => {
    setEditingId(income._id);
    setFormData({
      incomeId: income.incomeId || "",
      description: income.description,
      category: income.category,
      productType: income.productType,
      variant: income.variant || "",
      quantity: income.quantity,
      unitPrice: income.unitPrice,
      paymentMethod: income.paymentMethod,
      referenceNumber: income.referenceNumber || "",
      notes: income.notes || "",
      incomeDate: income.incomeDate.split("T")[0],
    });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/incomes/${id}`);
      fetchIncomes();
    } catch (err) {
      setError("Error deleting record");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter incomes
  const filteredIncomes = incomes.filter((inc) => {
    const matchCat =
      selectedCategory === "All" || inc.category === selectedCategory;
    const matchSearch = inc.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalIncome = filteredIncomes.reduce(
    (sum, inc) => sum + inc.quantity * inc.unitPrice,
    0
  );

  return (
    <div className="app-container">
      <div className="fixed w-full z-30 top-0">
        <Nav />
      </div>

      <div className="fixed w-full z-20 top-16">
        <Header />
      </div>

      <div className="fixed top-32 left-0 z-10">
        <Sidebar />
      </div>

      <div className="pl-64 pt-36 app-container">
        <div className="content-wrapper">
          <div className="main-content">
          <div className="income-container">
            <h2>📈 Income Management</h2>
            {error && <div className="error-message">{error}</div>}

            {/* Form */}
            <div className="income-form-container">
              <div className="form-actions">
                <button
                  type="button"
                  className="simulate-order-btn"
                  onClick={simulateCustomerOrder}
                  disabled={loading}
                >
                  🛍️ Auto-Fill Sample Order
                </button>
              </div>
              <form onSubmit={handleSubmit} className="income-form">
                <input type="text" placeholder="Income ID" value={formData.incomeId} readOnly />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {FRUIT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Product Type"
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Variant"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  required
                />
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Reference Number"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                />
                <input
                  type="date"
                  value={formData.incomeDate}
                  onChange={(e) => setFormData({ ...formData, incomeDate: e.target.value })}
                />
                <textarea
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <button type="submit" disabled={loading}>
                  {editingId ? "Update" : "Add"} Income
                </button>
              </form>

              {/* Filters */}
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All</option>
                  {FRUIT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p>Loading...</p>
            ) : filteredIncomes.length === 0 ? (
              <p>No records found.</p>
            ) : (
              <div className="table-container">
                <table className="income-table">
                  <thead>
                    <tr>
                      <th>Income ID</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncomes.map((inc) => (
                      <tr key={inc._id}>
                        <td>{inc.incomeId || "-"}</td>
                        <td>{inc.description}</td>
                        <td>{inc.category}</td>
                        <td>{inc.productType}</td>
                        <td>{inc.variant || "-"}</td>
                        <td>{inc.quantity}</td>
                        <td>Rs. {inc.unitPrice.toFixed(2)}</td>
                        <td>Rs. {(inc.quantity * inc.unitPrice).toFixed(2)}</td>
                        <td>{new Date(inc.incomeDate).toLocaleDateString()}</td>
                        <td className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(inc)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(inc._id)}
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
                  Total Income: Rs. {totalIncome.toLocaleString()}
                </h3>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Income;
