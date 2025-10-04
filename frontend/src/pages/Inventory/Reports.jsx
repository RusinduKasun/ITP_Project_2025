import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Download, FileText, Eye, Package, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "../../components/Inventory/Header";
import Sidebar from "../../components/Inventory/Sidebar";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");

  const [items, setItems] = useState([]);
  const [production, setProduction] = useState([]);
  const [fruits, setFruits] = useState([]);

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setItems([]);
    }
  };

  // Fetch production
  const fetchProduction = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/production");
      setProduction(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching production:", err);
      setProduction([]);
    }
  };

  // Fetch fruits
  const fetchFruits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fruits");
      setFruits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching fruits:", err);
      setFruits([]);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchProduction();
    fetchFruits();
  }, []);

  const reportTypes = [
    { id: "inventory", name: "Inventory Report", icon: Package },
    { id: "lowstock", name: "Low Stock Report", icon: AlertTriangle },
    { id: "production", name: "Production Report", icon: BarChart3 },
    { id: "items", name: "Items Report", icon: TrendingUp },
  ];

  const getCurrentData = () => {
    let data = [];
    switch (activeReport) {
      case "inventory":
        data = items || [];
        break;
      case "production":
        data = production || [];
        break;
      case "items":
        data = fruits || [];
        break;
      case "lowstock":
        data = (fruits || [])
          .filter(f => f.quantity <= f.reorderLevel)
          .map(f => ({
            ...f,
            status: f.quantity === 0 ? "Critical" : "Low",
          }));
        break;
      default:
        data = [];
    }

    if (searchTerm) {
      data = data.filter(item =>
        Object.values(item || {}).some(val =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return Array.isArray(data) ? data : [];
  };

  const currentReportData = getCurrentData();

  const getStatusColor = status => {
    switch (status) {
      case "Critical":
        return "bg-red-500 text-white";
      case "Low":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getTableHeaders = () => {
    switch (activeReport) {
      case "inventory":
        return ["Item Name", "Category", "Quantity", "Unit", "Purchase Price", "Date", "Action"];
      case "lowstock":
        return ["Name", "Quantity", "Reorder Level", "Status", "Action"];
      case "production":
        return ["Product", "Category", "Quantity Produced", "Unit", "Cost Per Unit", "Selling Price", "Action"];
      case "items":
        return ["Name", "Quantity", "Unit", "Reorder Level", "Action"];
      default:
        return [];
    }
  };

  const prepareDataForExport = (data) => {
    return data.map(item => {
      switch (activeReport) {
        case "inventory":
          return {
            "Item Name": item.itemName || "-",
            "Category": item.category || "-",
            "Quantity": item.quantity || 0,
            "Unit": item.unit || "-",
            "Purchase Price": `${item.purchasePrice || 0}`,
            "Date": item.dateOfArrival ? new Date(item.dateOfArrival).toLocaleDateString() : "-"
          };
        case "lowstock":
          return {
            "Name": item.name || "-",
            "Quantity": item.quantity || 0,
            "Reorder Level": item.reorderLevel || 0,
            "Status": item.status || "-"
          };
        case "production":
          return {
            "Product": item.productName || "-",
            "Category": item.category || "-",
            "Quantity Produced": item.quantityProduced || 0,
            "Unit": item.unit || "-",
            "Cost Per Unit": `${item.costPerUnit || 0}`,
            "Selling Price": `${item.sellingPrice || 0}`
          };
        case "items":
          return {
            "Name": item.name || "-",
            "Quantity": item.quantity || 0,
            "Unit": item.unit || "-",
            "Reorder Level": item.reorderLevel || 0
          };
        default:
          return item;
      }
    });
  };

  const downloadCSV = () => {
    const exportData = prepareDataForExport(currentReportData);
    if (!exportData.length) return alert("No data to export");

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeReport);
    XLSX.writeFile(wb, `${activeReport}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // PDF Export using jsPDF + autotable


  // PDF Export using HTML canvas / printable HTML approach
  const downloadPDF = () => {
    const exportData = prepareDataForExport(currentReportData);
    if (!exportData.length) return alert("No data to export");

    const reportName = reportTypes.find(r => r.id === activeReport)?.name || "Report";
    const currentDate = new Date().toLocaleDateString();
    const headers = Object.keys(exportData[0]);

    const htmlContent = `
    <html>
      <head>
        <title>${reportName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #28a745; padding-bottom: 15px; }
          .header h1 { color: #28a745; margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background-color: #28a745; color: white; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; text-align: left; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          tr:hover { background-color: #e8f5e8; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportName}</h1>
          <p>Generated on: ${currentDate} | Total Records: ${exportData.length}</p>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Report generated automatically by Farm Management System</p>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // printWindow.close(); // optional
        }, 500);
      };
    } else {
      // fallback: download HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport}_${new Date().toISOString().split("T")[0]}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('PDF generation opened in new window. If blocked, an HTML file was downloaded instead. You can print the HTML file as PDF.');
    }
  };






  return (
    <>
      <div className="fixed w-full z-20">
        <Header />
      </div>
      <div className="fixed top-16 left-0 z-10">
        <Sidebar />
      </div>
      <div className="pl-64 pt-20">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports Dashboard</h1>
              <p className="text-gray-600">Generate and download comprehensive business reports</p>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {reportTypes.map(r => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveReport(r.id)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${activeReport === r.id
                      ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg"
                      : "bg-white border-gray-200 hover:shadow-lg hover:border-green-200"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${activeReport === r.id ? "bg-green-500" : "bg-gray-100"}`}>
                        <Icon className={`${activeReport === r.id ? "text-white" : "text-gray-500"}`} size={24} />
                      </div>
                      <h3 className={`font-semibold text-sm ${activeReport === r.id ? "text-green-800" : "text-gray-800"}`}>{r.name}</h3>
                    </div>
                    {activeReport === r.id && <div className="text-xs text-green-600 font-medium">{currentReportData.length} records</div>}
                  </div>
                );
              })}
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{reportTypes.find(r => r.id === activeReport)?.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">Total Records: {currentReportData.length}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"><Download size={16} /> CSV</button>
                  <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"><FileText size={16} /> PDF</button>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 relative">
                <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  placeholder="Search across all columns..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-500  text-white">
                      {getTableHeaders().map((h, i) => <th key={i} className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReportData.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                        {activeReport === "inventory" && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemName || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.category || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.unit || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-600">${item.purchasePrice || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.dateOfArrival ? new Date(item.dateOfArrival).toLocaleDateString() : "-"}</td>
                          </>
                        )}
                        {activeReport === "lowstock" && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel || 0}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status || "-"}
                              </span>
                            </td>
                          </>
                        )}
                        {activeReport === "production" && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.category || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantityProduced || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.unit || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-red-600">${item.costPerUnit || 0}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-600">${item.sellingPrice || 0}</td>
                          </>
                        )}
                        {activeReport === "items" && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name || "-"}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.unit || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel || 0}</td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentReportData.length === 0 && (
                      <tr>
                        <td colSpan={getTableHeaders().length} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Package size={48} className="text-gray-300 mb-4" />
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
