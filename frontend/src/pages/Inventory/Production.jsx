import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Minus, ChevronDown, Edit3, Trash2, Search, Eye } from "lucide-react";
import Header from "../../components/Inventory/Header";
import Sidebar from "../../components/Inventory/Sidebar";

const Production = () => {
  const [fruits, setFruits] = useState([]);
  const [productions, setProductions] = useState([]);
  // Get current date in YYYY-MM-DD format for date input min
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    productName: "",
    category: "juice",
    ingredients: [{ item: "", quantityUsed: 0, unit: "kg" }],
    quantityProduced: 1,
    unit: "bottle",
    batchNumber: "",
    expiryDate: "",
    costPerUnit: 0,
    sellingPrice: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["chips", "noodles", "cordial", "rawfruit", "jam", "juice", "syrup"];
  const units = ["bottle", "jar", "pack", "kg", "pcs"];

  // Fetch fruits
  const fetchFruits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fruits");
      setFruits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch productions
  const fetchProductions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/production");
      setProductions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFruits();
    fetchProductions();
  }, []);

  // Ingredient handlers
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { item: "", quantityUsed: 0, unit: "kg" }],
    });
  };

  const updateIngredient = (index, field, value) => {
    const updated = formData.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    );
    setFormData({ ...formData, ingredients: updated });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  // Validate product name
  const validateProductName = (name) => {
    return /^[A-Za-z\s]+$/.test(name); // Only letters and spaces allowed
  };

  // Create or update production
  const handleSubmit = async () => {
    try {
      // Validate product name
      if (!formData.productName.trim()) {
        alert("Product name is required");
        return;
      }
      if (!validateProductName(formData.productName)) {
        alert("Product name should only contain letters");
        return;
      }

      // Map ingredients to include both id and name
      const ingredientsWithName = formData.ingredients.map((ing) => {
        if (!ing.item) return ing;

        const fruit = fruits.find(f => f._id === ing.item);
        return {
          ...ing,
          item: ing.item, // keep the _id
          name: fruit ? fruit.name : "", // store the name too
        };
      });

      const payload = { ...formData, ingredients: ingredientsWithName };

      if (editingId) {
        // Get the old production
        const oldProd = productions.find(p => p._id === editingId);

        // Restore old ingredient quantities
        for (let ing of oldProd.ingredients) {
          if (!ing.item) continue;
          const fruit = fruits.find(f => f._id === ing.item);
          if (fruit) {
            await axios.put(`http://localhost:5000/api/fruits/${fruit._id}`, {
              quantity: fruit.quantity + ing.quantityUsed
            });
          }
        }

        // Update production
        await axios.put(`http://localhost:5000/api/production/${editingId}`, payload);

        // Deduct new ingredient quantities
        for (let ing of ingredientsWithName) {
          if (!ing.item) continue;
          const fruit = fruits.find(f => f._id === ing.item);
          if (fruit) {
            await axios.put(`http://localhost:5000/api/fruits/${fruit._id}`, {
              quantity: fruit.quantity - ing.quantityUsed
            });
          }
        }

      } else {
        // Create new production
        await axios.post("http://localhost:5000/api/production", payload);

        // Deduct ingredients
        for (let ing of ingredientsWithName) {
          const fruit = fruits.find(f => f._id === ing.item);
          if (fruit) {
            await axios.put(`http://localhost:5000/api/fruits/${fruit._id}`, {
              quantity: fruit.quantity - ing.quantityUsed
            });
          }
        }
      }

      setFormData({
        productName: "",
        category: "juice",
        ingredients: [{ item: "", quantityUsed: 0, unit: "kg" }],
        quantityProduced: 1,
        unit: "bottle",
        batchNumber: "",
        expiryDate: "",
        costPerUnit: 0,
        sellingPrice: 0,
      });
      setEditingId(null);
      fetchFruits();
      fetchProductions();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error processing production");
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this production?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/production/${id}`);
      fetchProductions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prod) => {
    const ingredientsForForm = prod.ingredients.map(ing => {
      let itemId = "";
      let name = ""; // add name

      if (ing.item) {
        if (typeof ing.item === "object" && ing.item._id) {
          itemId = ing.item._id;
          name = ing.item.name || ""; // get name from object if exists
        } else {
          itemId = ing.item;
          // fallback: try to find name from fruits list
          const fruit = fruits.find(f => f._id === ing.item);
          name = fruit ? fruit.name : "";
        }
      }

      return {
        ...ing,
        item: itemId, // _id string
        name,        // store name
      };
    });

    setFormData({
      productName: prod.productName,
      category: prod.category,
      ingredients: ingredientsForForm,
      quantityProduced: prod.quantityProduced,
      unit: prod.unit,
      batchNumber: prod.batchNumber,
      expiryDate: prod.expiryDate?.split("T")[0] || "",
      costPerUnit: prod.costPerUnit,
      sellingPrice: prod.sellingPrice,
    });

    setEditingId(prod._id);
  };


  const filteredProductions = productions.filter(prod =>
    prod.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estimatedCost = formData.costPerUnit * formData.quantityProduced;
  const profitMargin = formData.sellingPrice > 0
    ? (((formData.sellingPrice - formData.costPerUnit) / formData.sellingPrice) * 100).toFixed(0)
    : 0;

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Production</h1>
            <p className="text-gray-600">Create new products from your available fruit inventory</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Product Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Create New Product</h2>
              <div className="space-y-6">
                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Mixed Fruit Juice"
                      value={formData.productName}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^[A-Za-z\s]+$/.test(value)) {
                          setFormData({ ...formData, productName: value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      title="Product name should only contain letters and spaces"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Required Ingredients</label>
                  <div className="space-y-3">
                    {formData.ingredients.map((ing, i) => {


                      return (
                        <div key={i} className="flex gap-3 items-end">
                          {/* Fruit Dropdown */}
                          <div className="flex-1">
                            <select
                              value={ing.item || ""}
                              onChange={(e) => updateIngredient(i, "item", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Select fruit</option>
                              {fruits.map((f) => (
                                <option key={f._id} value={f._id}>
                                  {f.name} ({f.quantity} {f.unit})
                                </option>
                              ))}
                            </select>

                          </div>

                          {/* Quantity Used */}
                          <div className="w-20">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="1"
                              value={ing.quantityUsed || 0}
                              onChange={(e) =>
                                updateIngredient(i, "quantityUsed", parseFloat(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>


                          {/* Unit */}
                          <div className="w-20">
                            <select
                              value={ing.unit || "kg"}
                              onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              {units.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Remove Ingredient Button */}
                          {formData.ingredients.length > 1 && (
                            <button
                              onClick={() => removeIngredient(i)}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                  </div>
                  <button onClick={addIngredient} className="flex items-center gap-2 text-green-600 hover:text-green-700 mt-3 text-sm font-medium">
                    <Plus size={16} /> Add Ingredient
                  </button>
                </div>

                {/* Production Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Produce</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantityProduced}
                      onChange={(e) => setFormData({ ...formData, quantityProduced: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      min={getCurrentDate()}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Summary & Submit */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4 ">
                  <div className="flex justify-between text-sm ">
                    <span>Estimated Cost:</span> <span>${estimatedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm my-2">
                    <span>Sale Price per Unit:</span> <span>${formData.sellingPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin:</span>
                    <span className={`px-2 py-1 rounded text-xs ${profitMargin > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {profitMargin}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg mt-4"
                >
                  {editingId ? "Update Production" : "Create Product & Update Inventory"}
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Created Products</h2>
                <p className="text-gray-600 text-sm mt-1">Total: {filteredProductions.length} products</p>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredProductions.length > 0 ? (
                  filteredProductions.map((prod) => (
                    <div key={prod._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{prod.productName}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{prod.category}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div><span className="font-medium">Quantity:</span> {prod.quantityProduced} {prod.unit}</div>
                          <div><span className="font-medium">Price:</span> ${prod.sellingPrice}</div>
                          <div><span className="font-medium">Batch:</span> {prod.batchNumber}</div>
                          <div><span className="font-medium">Expiry:</span> {prod.expiryDate?.split("T")[0]}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleEdit(prod)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(prod._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Production;

