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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
    reorderLevel: 0,
  });

  const allowedFruits = ["Wood Apple", "Jackfruit", "Banana", "Durian"];
  const units = ["kg", "pcs", "box"];

  // Fetch fruits from backend
  const fetchFruits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/fruits", {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setFruits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching fruits:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch fruits");
      setFruits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  // Add or update fruit
  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name || formData.name.trim() === "") {
        alert("Please select a fruit");
        return;
      }

      if (formData.quantity < 0) {
        alert("Quantity cannot be negative");
        return;
      }

      if (!formData.unit || !units.includes(formData.unit)) {
        alert("Please select a valid unit");
        return;
      }

      if (formData.reorderLevel < 0) {
        alert("Reorder level cannot be negative");
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const validatedData = {
        ...formData,
        quantity: Number(formData.quantity),
        reorderLevel: Number(formData.reorderLevel)
      };

      if (editingFruit) {
        await axios.put(
          `/api/fruits/${editingFruit._id}`,
          validatedData,
          config
        );
      } else {
        await axios.post("/api/fruits", validatedData, config);
      }
      fetchFruits();
      setShowModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Error saving fruit";
      alert(errorMessage);
      console.error("Error saving fruit:", errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fruit?")) return;
    try {
      await axios.delete(`/api/fruits/${id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      fetchFruits();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Error deleting fruit";
      alert(errorMessage);
      console.error("Error deleting fruit:", errorMessage);
    }
  };

  const handleAdd = () => {
    setEditingFruit(null);
    setFormData({ name: "", quantity: 0, unit: "kg", reorderLevel: 0 });
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

  const filteredFruits = Array.isArray(fruits) 
    ? fruits.filter((fruit) => (fruit?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];

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
            {/* Loading and Error States */}
            {isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading fruits...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-4">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchFruits}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Fruit List */}
            <div className="space-y-4">
              {!isLoading && !error && filteredFruits.map((fruit) => {
                const isLowStock = fruit?.quantity <= fruit?.reorderLevel; // check low stock

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
                      <select
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="" disabled>Select a fruit</option>
                        {allowedFruits.map((fruit) => (
                          <option key={fruit} value={fruit}>
                            {fruit}
                          </option>
                        ))}
                      </select>
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
