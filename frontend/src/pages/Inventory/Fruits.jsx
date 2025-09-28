import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Edit3, Trash2, X } from "lucide-react";
import Header from "../../components/Inventory/Header";
import Sidebar from "../../components/Inventory/Sidebar";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Fresh",
    quantity: 0,
    unit: "kg",
    purchasePrice: 0,
    supplierName: "",
    reorderLevel: 10,
    expiryDate: "",
    stockAction: "increase",
    stockChange: 0,
  });

  const categories = ["Fresh", "Frozen"];
  const units = ["kg", "pcs", "box"];

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  // Fetch fruits
  const fetchFruits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fruits");
      setFruits(res.data);
    } catch (err) {
      console.error("Error fetching fruits:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchFruits();
  }, []);
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/suppliers");
        setSuppliers(res.data); // this will be an array of names
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleFruitSelect = (fruitId) => {
    const fruit = fruits.find((f) => f._id === fruitId);
    setSelectedFruit(fruit);
    setFormData({
      ...formData,
      itemName: fruit.name,
      unit: fruit.unit,
    });
  };

  const handleSubmit = async () => {
    try {
      let updatedForm = { ...formData };

      if (editingItem) {
        // Update inventory quantity
        let newQuantity = editingItem.quantity;
        if (formData.stockChange > 0) {
          if (formData.stockAction === "increase") {
            newQuantity += formData.stockChange;
          } else {
            newQuantity = Math.max(0, newQuantity - formData.stockChange);
          }
        }
        updatedForm.quantity = newQuantity;

        // Sync change with fruit database
        if (selectedFruit && formData.stockChange > 0) {
          let updatedFruitQty = selectedFruit.quantity;
          if (formData.stockAction === "increase") {
            updatedFruitQty += formData.stockChange; // inventory increase adds to fruit stock
          } else {
            updatedFruitQty = Math.max(0, updatedFruitQty - formData.stockChange); // decrease
          }
          await axios.put(
            `http://localhost:5000/api/fruits/${selectedFruit._id}`,
            { ...selectedFruit, quantity: updatedFruitQty }
          );
        }

        await axios.put(
          `http://localhost:5000/api/inventory/${editingItem._id}`,
          updatedForm
        );
      } else {
        // New inventory item
        await axios.post("http://localhost:5000/api/inventory", updatedForm);
        // Increase fruit database quantity by added inventory
        if (selectedFruit && formData.quantity > 0) {
          const updatedFruitQty = selectedFruit.quantity + formData.quantity;
          await axios.put(
            `http://localhost:5000/api/fruits/${selectedFruit._id}`,
            { ...selectedFruit, quantity: updatedFruitQty }
          );
        }
      }

      fetchInventory();
      fetchFruits();
      setShowModal(false);
      setSelectedFruit(null);
    } catch (err) {
      alert(err.response?.data?.error || "Error saving item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert("Error deleting item");
    }
  };

  // Get current date in YYYY-MM-DD format for date input min
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setSelectedFruit(null);
    setFormData({
      itemName: "",
      category: "Fresh",
      quantity: 0,
      unit: "kg",
      purchasePrice: 0,
      supplierName: "",
      reorderLevel: 10,
      expiryDate: "",
      stockAction: "increase",
      stockChange: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const fruit = fruits.find((f) => f.name === item.itemName);
    setSelectedFruit(fruit || null);

    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      supplierName: item.supplierName,
      reorderLevel: item.reorderLevel || 10,
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
      stockAction: "increase",
      stockChange: 0,
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedFruit(null);
  };

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="fixed w-full z-20">
        <Header />
      </div>
      <div className="fixed top-16 left-0 z-10">
        <Sidebar />
      </div>
      <div className="pl-64 pt-20">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Inventory Management
              </h1>

              <button
                onClick={handleAdd}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} /> Add Inventory
              </button>
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Inventory List */}
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity <= item.reorderLevel;
                return (
                  <div key={item._id} className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{item.itemName}</h3>
                          <span className="text-gray-500 text-sm">{item.category}</span>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${isLowStock
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                              }`}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Stock: {item.quantity} {item.unit} • Price: $
                          {item.purchasePrice}/{item.unit} • Supplier: {item.supplierName}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Reorder Level: {item.reorderLevel} • Expiry:{" "}
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingItem ? "Edit Item" : "Add New Item"}
                    </h2>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Fruit Select */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Fruit *</label>
                      <select
                        value={selectedFruit?._id || ""}
                        onChange={(e) => handleFruitSelect(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">-- Select Fruit --</option>
                        {fruits.map((fruit) => (
                          <option key={fruit._id} value={fruit._id}>
                            {fruit.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Show current fruit quantity */}
                    {selectedFruit && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Fruit Quantity</label>
                        <input
                          type="number"
                          value={selectedFruit.quantity}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                        />
                      </div>
                    )}

                    {/* Inventory Fields */}
                    {!editingItem && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Inventory Quantity *</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Other fields like category, price, supplier */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Supplier Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Name *
                      </label>
                      <select
                        value={formData.supplierName}
                        onChange={(e) =>
                          setFormData({ ...formData, supplierName: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select a supplier</option>
                        {suppliers.map((supplier, idx) => (
                          <option key={supplier._id} value={supplier.name}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reorder Level *
                      </label>
                      <input
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        min={getCurrentDate()}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                      {editingItem ? "Update Item" : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
