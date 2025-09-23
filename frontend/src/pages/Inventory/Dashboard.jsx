import React, { useState, useEffect } from "react";
import axios from "axios";
import { Apple, Package, DollarSign, AlertTriangle, Calendar } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "../../components/Inventory/Header";
import Sidebar from "../../components/Inventory/Sidebar";
import Nav from "../Home/Nav/Nav.jsx";

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [selectedItem, setSelectedItem] = useState("All");
  const [inventory, setInventory] = useState([]);
  const [production, setProduction] = useState([]);
  const [fruits, setFruits] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, prodRes, fruitRes] = await Promise.all([
          axios.get("http://localhost:5000/api/inventory"),
          axios.get("http://localhost:5000/api/production"),
          axios.get("http://localhost:5000/api/fruits")
        ]);
        setInventory(Array.isArray(invRes.data) ? invRes.data : []);
        setProduction(Array.isArray(prodRes.data) ? prodRes.data : []);
        setFruits(Array.isArray(fruitRes.data) ? fruitRes.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const totalFruits = fruits.reduce((sum, f) => sum + (f.quantity || 0), 0);
  const productsCreated = production.length;
  const lowStockItems = fruits.filter(f => f.quantity < f.reorderLevel).length;
  const totalValue = inventory.reduce((sum, i) => sum + ((i.quantity || 0) * (i.purchasePrice || 0)), 0);

  // Prepare chart data
  const chartData = production.map(p => ({
    date: p.dateOfProduction?.split("T")[0] || "-",
    [p.productName]: p.quantityProduced || 0
  }));

  // Merge data for "All" selection
  const mergedChartData = chartData.reduce((acc, cur) => {
    const existing = acc.find(d => d.date === cur.date);
    if (existing) Object.assign(existing, cur);
    else acc.push(cur);
    return acc;
  }, []);

  // Filter by date
  const filteredData = mergedChartData.filter(d => {
    const date = new Date(d.date);
    const from = dateFilter.from ? new Date(dateFilter.from) : null;
    const to = dateFilter.to ? new Date(dateFilter.to) : null;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });

  // Get unique products for dropdown
  const products = ["All", ...new Set(production.map(p => p.productName))];

  return (
    <>
      {/* Site navigation */}
      <div className="fixed w-full z-30 top-0">
        <Nav />
      </div>

      {/* Inventory header - positioned below Nav */}
      <div className="fixed w-full z-20 top-16">
        <Header />
      </div>

      {/* Sidebar positioned below Nav + Header */}
      <div className="fixed top-32 left-0 z-10">
        <Sidebar />
      </div>

      {/* Main content: add top padding to clear Nav + Header and left padding for sidebar */}
      <div className="pl-64 pt-36">
        <div className="p-8 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your fruit business management dashboard</p>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
              <Apple className="text-green-600" size={28} />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Fruits in Stock</h3>
                <p className="text-lg font-semibold text-gray-800">{totalFruits}</p>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
              <Package className="text-blue-600" size={28} />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Products Created</h3>
                <p className="text-lg font-semibold text-gray-800">{productsCreated}</p>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
              <AlertTriangle className="text-red-500" size={28} />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
                <p className="text-lg font-semibold text-gray-800">{lowStockItems}</p>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
              <DollarSign className="text-yellow-600" size={28} />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
                <p className="text-lg font-semibold text-gray-800">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Production Chart */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Production Overview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products.filter(p => p !== "All").map(p =>
                    (selectedItem === "All" || selectedItem === p) && (
                      <Line key={p} type="monotone" dataKey={p} stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} strokeWidth={2} />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
