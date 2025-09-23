import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import Header from "../../components/Inventory/Header";
import Sidebar from "../../components/Inventory/Sidebar";

const FruitInventory = () => {
  const [fruits, setFruits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFruit, setEditingFruit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
  });

  const units = ["kg", "pcs", "box"];

  // Fetch fruits from backend
  const fetchFruits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fruits");
      setFruits(res.data);
    } catch (err) {
      console.error("Error fetching fruits:", err);
    }
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  // Add or update fruit
  const handleSubmit = async () => {
    try {
      if (editingFruit) {
        await axios.put(
          `http://localhost:5000/api/fruits/${editingFruit._id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/fruits", formData);
      }
      fetchFruits();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Error saving fruit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fruit?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fruits/${id}`);
      fetchFruits();
    } catch (err) {
      alert("Error deleting fruit");
    }
  };

  const handleAdd = () => {
    setEditingFruit(null);
    setFormData({ name: "", quantity: 0, unit: "kg" });
    setShowModal(true);
  };

  const handleEdit = (fruit) => {
    setEditingFruit(fruit);
    setFormData({
      name: fruit.name,
      quantity: fruit.quantity,
      unit: fruit.unit,
      reorderLevel: fruit.reorderLevel,
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingFruit(null);
  };

  const filteredFruits = fruits.filter((fruit) =>
    fruit.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Fruit Management</h1>
              <button
                onClick={handleAdd}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Add Fruit
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search fruits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Fruit List */}
            {/* Fruit List */}
            <div className="space-y-4">
              {filteredFruits.map((fruit) => {
                const isLowStock = fruit.quantity <= fruit.reorderLevel; // check low stock

                return (
                  <div
                    key={fruit._id}
                    className="bg-white rounded-lg border p-6 flex justify-between items-center"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Title + Stock Badge */}
                      <div className="flex items-center justify-between ">
                        <h3 className="text-lg font-semibold text-gray-800">{fruit.name}</h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </div>

                      {/* Quantity and Reorder Info with colored text */}
                      <p className="text-sm flex flex-row gap-3 style-none">
                        Quantity: <span className={isLowStock ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>{fruit.quantity} {fruit.unit}</span> •
                        Reorder Level: <span className={isLowStock ? "text-red-600 font-semibold" : "text-blue-600 font-semibold"}>{fruit.reorderLevel}</span>
                      </p>
                    </div>




                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(fruit)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(fruit._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>


            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingFruit ? "Edit Fruit" : "Add New Fruit"}
                    </h2>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Fruit Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity *</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit *</label>
                      <select
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reorder Level */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Reorder Level *</label>
                      <input
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) =>
                          setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                  </div>

                  {/* Actions */}
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
                      {editingFruit ? "Update Fruit" : "Add Fruit"}
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

export default FruitInventory;
