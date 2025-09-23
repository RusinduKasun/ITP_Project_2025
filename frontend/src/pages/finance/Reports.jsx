import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Reports.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Header from "../../components/Finance/layout/Header";
import Sidebar from "../../components/Finance/layout/Sidebar";
import Nav from "../Home/Nav/Nav.jsx";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [activeTab, setActiveTab] = useState("overview");
  const overviewRef = useRef(null);
  const incomeRef = useRef(null);
  const expenseRef = useRef(null);
  const wastageRef = useRef(null);
  const profitMarginRef = useRef(null);
  const breakEvenRef = useRef(null);

  // Date filter options
  const dateFilterOptions = [
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "custom", label: "Custom Range" }
  ];

  // Tab options
  const tabOptions = [
    { value: "overview", label: "📊 Overview" },
    { value: "income", label: "💰 Income Tracking" },
    { value: "expense", label: "💸 Expense Tracking" },
    { value: "breakEven", label: "⚖️ Break-even Analysis" },
    { value: "wastage", label: "🗑️ Wastage Cost Estimation" },
    { value: "profitMargin", label: "📊 Profit Margin" }
  ];

  // Generic PDF Export Function
  const exportSectionToPDF = async (sectionRef, sectionName, sectionTitle) => {
    if (!sectionRef.current) {
      alert(`${sectionName} section not found. Please ensure you are on the correct tab.`);
      return;
    }

    try {
      // Set active tab to the target section to ensure content is visible
      setActiveTab(sectionName);

      // Wait a moment for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas from the section
      const canvas = await html2canvas(sectionRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: sectionRef.current.scrollWidth,
        height: sectionRef.current.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(sectionTitle, 20, 20);

      // Add date filter info
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const dateFilterLabel = dateFilterOptions.find(option => option.value === dateFilter)?.label || 'This Month';
      pdf.text(`Report Period: ${dateFilterLabel}`, 20, 30);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

      // Add the image
      let position = 45; // Start position after title
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position;

      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `Finance_Reports_${sectionName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Specific export functions for each section
  const exportOverviewToPDF = () => exportSectionToPDF(overviewRef, 'overview', 'Finance Reports & Analytics - Overview');
  const exportIncomeToPDF = () => exportSectionToPDF(incomeRef, 'income', 'Income Tracking Report');
  const exportExpenseToPDF = () => exportSectionToPDF(expenseRef, 'expense', 'Expense Tracking Report');
  const exportWastageToPDF = () => exportSectionToPDF(wastageRef, 'wastage', 'Wastage Cost Estimation Report');
  const exportProfitMarginToPDF = () => exportSectionToPDF(profitMarginRef, 'profitMargin', 'Profit Margin Analysis Report');
  const exportBreakEvenToPDF = () => exportSectionToPDF(breakEvenRef, 'breakEven', 'Break-even Analysis Report');

  // Excel Export Functions
  const exportOverviewToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Summary data
    const summaryData = [
      ['Metric', 'Value', 'Details'],
      ['Total Income', financeData.summary.totalIncome, `${financeData.summary.counts?.incomeCount || 0} transactions`],
      ['Total Expenses', financeData.summary.totalExpenses, `${financeData.summary.counts?.expenseCount || 0} transactions`],
      ['Total Wastage', financeData.summary.totalWastage, `${financeData.summary.counts?.wastageCount || 0} records`],
      ['Net Profit/Loss', financeData.summary.profit, financeData.summary.profit >= 0 ? 'Profit' : 'Loss'],
      ['Profit Margin', `${financeData.summary.profitMargin.toFixed(2)}%`, ''],
      ['Wastage % of Expenses', `${financeData.summary.wastagePercentage.toFixed(2)}%`, ''],
      ['Break-even Units', financeData.summary.breakEvenUnits, ''],
      ['Average Unit Price', financeData.summary.avgUnitPrice, ''],
      ['Average Unit Cost', financeData.summary.avgUnitCost, '']
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Recent Incomes
    if (financeData.tables?.recentIncomes?.length > 0) {
      const incomeData = [
        ['Date', 'Category', 'Description', 'Quantity', 'Unit Price', 'Total Amount', 'Reference Number']
      ];
      financeData.tables.recentIncomes.forEach(income => {
        incomeData.push([
          new Date(income.incomeDate).toLocaleDateString(),
          income.category,
          income.description,
          income.quantity,
          income.unitPrice,
          income.quantity * income.unitPrice,
          income.referenceNumber || ''
        ]);
      });
      const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Recent Incomes');
    }

    // Recent Expenses
    if (financeData.tables?.recentExpenses?.length > 0) {
      const expenseData = [
        ['Date', 'Category', 'Description', 'Amount', 'Finance Manager', 'Payment Method']
      ];
      financeData.tables.recentExpenses.forEach(expense => {
        expenseData.push([
          new Date(expense.expenseDate).toLocaleDateString(),
          expense.category,
          expense.description,
          expense.amount,
          expense.financeManager || '',
          expense.paymentMethod || ''
        ]);
      });
      const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Recent Expenses');
    }

    // Top Products
    if (financeData.tables?.topProducts?.length > 0) {
      const productData = [
        ['Product', 'Total Revenue', 'Total Quantity', 'Transaction Count']
      ];
      financeData.tables.topProducts.forEach(product => {
        productData.push([
          product._id,
          product.totalRevenue,
          product.totalQuantity,
          product.count
        ]);
      });
      const productSheet = XLSX.utils.aoa_to_sheet(productData);
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Top Products');
    }

    const fileName = `Finance_Reports_Overview_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportIncomeToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Income Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Revenue', financeData.summary.totalIncome],
      ['Average Transaction', financeData.summary.counts?.incomeCount > 0 ? (financeData.summary.totalIncome / financeData.summary.counts.incomeCount) : 0],
      ['Total Transactions', financeData.summary.counts?.incomeCount || 0]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Income Summary');

    // Recent Income Transactions
    if (financeData.tables?.recentIncomes?.length > 0) {
      const incomeData = [
        ['Date', 'Source', 'Description', 'Total Amount']
      ];
      financeData.tables.recentIncomes.forEach(income => {
        incomeData.push([
          new Date(income.incomeDate).toLocaleDateString(),
          income.category,
          income.description,
          income.quantity * income.unitPrice
        ]);
      });
      const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Recent Income Transactions');
    }

    const fileName = `Finance_Reports_Income_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportExpenseToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Expense Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Expenses', financeData.summary.totalExpenses],
      ['Average Transaction', financeData.summary.counts?.expenseCount > 0 ? (financeData.summary.totalExpenses / financeData.summary.counts.expenseCount) : 0],
      ['Total Transactions', financeData.summary.counts?.expenseCount || 0]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Expense Summary');

    // Recent Expense Transactions
    if (financeData.tables?.recentExpenses?.length > 0) {
      const expenseData = [
        ['Date', 'Category', 'Description', 'Amount (Rs)']
      ];
      financeData.tables.recentExpenses.forEach(expense => {
        expenseData.push([
          new Date(expense.expenseDate).toLocaleDateString(),
          expense.category,
          expense.description,
          expense.amount
        ]);
      });
      const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Recent Expense Transactions');
    }

    const fileName = `Finance_Reports_Expense_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportWastageToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Wastage Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Wastage Cost', financeData.summary.totalWastage],
      ['Wastage % of Expenses', `${financeData.summary.wastagePercentage.toFixed(2)}%`],
      ['Wastage Records', financeData.summary.counts?.wastageCount || 0]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Wastage Summary');

    // Wastage by Category
    if (financeData.charts?.wastageBreakdown?.length > 0) {
      const wastageData = [
        ['Category', 'Total Cost (Rs)', 'Records', '% of Total Wastage']
      ];
      financeData.charts.wastageBreakdown.forEach(item => {
        wastageData.push([
          item._id,
          item.totalValue,
          item.count,
          ((item.totalValue / financeData.summary.totalWastage) * 100).toFixed(1) + '%'
        ]);
      });
      const wastageSheet = XLSX.utils.aoa_to_sheet(wastageData);
      XLSX.utils.book_append_sheet(workbook, wastageSheet, 'Wastage by Category');
    }

    const fileName = `Finance_Reports_Wastage_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportProfitMarginToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Profit Margin Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Current Profit Margin', `${financeData.summary.profitMargin.toFixed(1)}%`],
      ['Net Profit/Loss', financeData.summary.profit],
      ['Revenue Efficiency', financeData.summary.profitMargin >= 20 ? 'Excellent' :
        financeData.summary.profitMargin >= 10 ? 'Good' :
          financeData.summary.profitMargin >= 0 ? 'Needs Improvement' : 'Critical']
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Profit Margin Summary');

    // Profit Margin Breakdown
    const breakdownData = [
      ['Metric', 'Amount (Rs)', 'Percentage', 'Status'],
      ['Total Revenue', financeData.summary.totalIncome, '100%', '✅ Base'],
      ['Total Expenses', financeData.summary.totalExpenses, `${((financeData.summary.totalExpenses / financeData.summary.totalIncome) * 100).toFixed(1)}%`, '📊 Cost'],
      ['Wastage Cost', financeData.summary.totalWastage, `${((financeData.summary.totalWastage / financeData.summary.totalIncome) * 100).toFixed(1)}%`, '⚠️ Loss'],
      ['Net Profit/Loss', financeData.summary.profit, `${financeData.summary.profitMargin.toFixed(1)}%`, financeData.summary.profit >= 0 ? '✅ Profit' : '❌ Loss']
    ];

    const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData);
    XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Profit Margin Breakdown');

    const fileName = `Finance_Reports_ProfitMargin_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportBreakEvenToExcel = () => {
    if (!financeData) return;

    const workbook = XLSX.utils.book_new();

    // Break-even Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Break-even Units', financeData.summary.breakEvenUnits],
      ['Average Unit Price', financeData.summary.avgUnitPrice],
      ['Average Unit Cost', financeData.summary.avgUnitCost]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Break-even Summary');

    // Break-even Analysis Details
    const totalUnitsSold = financeData.tables?.recentIncomes?.reduce((sum, income) => sum + income.quantity, 0) || 0;
    const analysisData = [
      ['Component', 'Amount (Rs)', 'Calculation', 'Impact'],
      ['Total Revenue', financeData.summary.totalIncome, 'Sum of all sales', '📈 Positive'],
      ['Total Expenses', financeData.summary.totalExpenses, 'Operating costs', '📉 Negative'],
      ['Wastage Cost', financeData.summary.totalWastage, 'Lost inventory value', '⚠️ Negative'],
      ['Total Units Sold', totalUnitsSold, 'Sum of quantities', '📊 Volume'],
      ['Break-even Point', `${financeData.summary.breakEvenUnits} units`, 'Fixed costs ÷ (Price - Variable cost)', '🎯 Target']
    ];

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Break-even Analysis');

    const fileName = `Finance_Reports_BreakEven_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (dateFilter) {
      case "thisMonth":
        return {
          startDate: new Date(year, month, 1).toISOString().split('T')[0],
          endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
        };
      case "lastMonth":
        return {
          startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
          endDate: new Date(year, month, 0).toISOString().split('T')[0]
        };
      case "thisYear":
        return {
          startDate: new Date(year, 0, 1).toISOString().split('T')[0],
          endDate: new Date(year, 11, 31).toISOString().split('T')[0]
        };
      default:
        return {};
    }
  };

  // Fetch finance summary data
  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRange();
      const params = new URLSearchParams();

      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(`http://localhost:5000/api/finance/summary?${params}`);
      setFinanceData(response.data);
    } catch (err) {
      console.error("Error fetching finance data:", err);
      setError("Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [dateFilter]);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={fetchFinanceData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-reports-root">
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
          <div className="reports-page">
            {/* Header */}
            <div className="reports-header">
              <h1>📊 Finance Reports & Analytics</h1>
              <div className="header-controls">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-filter-select"
                >
                  {dateFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button className="export-btn primary" onClick={exportOverviewToPDF}>📄 Export All Reports</button>
                <button className="export-btn" onClick={exportOverviewToExcel}>📊 Export Excel</button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-navigation">
              {tabOptions.map((tab) => (
                <button
                  key={tab.value}
                  className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {financeData && financeData.summary && (
              <div className="tab-content">
                {activeTab === "overview" && (
                  <div ref={overviewRef}>
                    <h2>📊 Key Performance Indicators</h2>
                    <div className="kpi-cards-grid">
                      <div className="kpi-card income">
                        <div className="kpi-header">
                          <div className="kpi-icon">💰</div>
                          <div className="kpi-title">Total Income</div>
                        </div>
                        <div className="kpi-value">Rs. {financeData.summary.totalIncome?.toLocaleString() || '0'}</div>
                        <div className="kpi-subtitle">{financeData.summary.counts?.incomeCount || 0} transactions</div>
                      </div>

                      <div className="kpi-card expense">
                        <div className="kpi-header">
                          <div className="kpi-icon">💸</div>
                          <div className="kpi-title">Total Expenses</div>
                        </div>
                        <div className="kpi-value">Rs. {financeData.summary.totalExpenses?.toLocaleString() || '0'}</div>
                        <div className="kpi-subtitle">{financeData.summary.counts?.expenseCount || 0} transactions</div>
                      </div>

                      <div className={`kpi-card ${(financeData.summary.profit || 0) >= 0 ? 'profit' : 'loss'}`}>
                        <div className="kpi-header">
                          <div className="kpi-icon">{(financeData.summary.profit || 0) >= 0 ? '📈' : '📉'}</div>
                          <div className="kpi-title">Net Profit</div>
                        </div>
                        <div className="kpi-value">Rs. {(financeData.summary.profit || 0).toLocaleString()}</div>
                        <div className="kpi-subtitle">{(financeData.summary.profit || 0) >= 0 ? 'Profitable' : 'Loss'}</div>
                      </div>

                      <div className={`kpi-card ${(financeData.summary.profitMargin || 0) >= 20 ? 'profit' : (financeData.summary.profitMargin || 0) >= 10 ? 'warning' : 'loss'}`}>
                        <div className="kpi-header">
                          <div className="kpi-icon">📊</div>
                          <div className="kpi-title">Profit Margin</div>
                        </div>
                        <div className="kpi-value">{(financeData.summary.profitMargin || 0).toFixed(1)}%</div>
                        <div className="kpi-subtitle">
                          {(financeData.summary.profitMargin || 0) >= 20 ? 'Excellent' :
                            (financeData.summary.profitMargin || 0) >= 10 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>

                      <div className={`kpi-card ${(financeData.summary.wastagePercentage || 0) > 15 ? 'warning' : 'neutral'}`}>
                        <div className="kpi-header">
                          <div className="kpi-icon">🗑️</div>
                          <div className="kpi-title">Wastage Cost</div>
                        </div>
                        <div className="kpi-value">Rs. {(financeData.summary.totalWastage || 0).toLocaleString()}</div>
                        <div className="kpi-subtitle">{(financeData.summary.wastagePercentage || 0).toFixed(1)}% of expenses</div>
                      </div>

                      <div className="kpi-card info">
                        <div className="kpi-header">
                          <div className="kpi-icon">⚖️</div>
                          <div className="kpi-title">Break-even Units</div>
                        </div>
                        <div className="kpi-value">{(financeData.summary.breakEvenUnits || 0).toLocaleString()}</div>
                        <div className="kpi-subtitle">Avg price: Rs. {(financeData.summary.avgUnitPrice || 0).toFixed(0)}</div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="insights-section">
                      <h2>💡 Business Insights & Alerts</h2>
                      <div className="insights-grid">
                        {financeData.insights?.map((insight, index) => (
                          <div key={index} className={`insight-alert ${insight.type}`}>
                            <span className="insight-icon">{insight.icon}</span>
                            <span className="insight-message">{insight.message}</span>
                          </div>
                        )) || (
                            <div className="insight-alert info">
                              <span className="insight-icon">ℹ️</span>
                              <span className="insight-message">No insights available for the selected period</span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="charts-section">
                      <h2>📈 Financial Trends</h2>
                      <div className="charts-grid">
                        <div className="chart-card">
                          <h3>Monthly Income vs Expenses</h3>
                          {financeData.charts?.monthlyData?.length > 0 ? (
                            <Bar
                              data={{
                                labels: financeData.charts.monthlyData.map(item =>
                                  `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
                                ),
                                datasets: [
                                  {
                                    label: 'Income',
                                    data: financeData.charts.monthlyData.map(item => item.income),
                                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1
                                  },
                                  {
                                    label: 'Expenses',
                                    data: financeData.charts.monthlyExpenses?.map(item => item.expenses) || [],
                                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: true,
                                    text: 'Monthly Financial Performance'
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      callback: function (value) {
                                        return 'Rs. ' + value.toLocaleString();
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="chart-placeholder">
                              <p>📊 No monthly data available</p>
                            </div>
                          )}
                        </div>

                        <div className="chart-card">
                          <h3>Wastage Distribution</h3>
                          {financeData.charts?.wastageBreakdown?.length > 0 ? (
                            <Pie
                              data={{
                                labels: financeData.charts.wastageBreakdown.map(item => item._id),
                                datasets: [{
                                  data: financeData.charts.wastageBreakdown.map(item => item.totalValue),
                                  backgroundColor: [
                                    '#FF6384',
                                    '#36A2EB',
                                    '#FFCE56',
                                    '#4BC0C0',
                                    '#9966FF'
                                  ],
                                  hoverBackgroundColor: [
                                    '#FF6384',
                                    '#36A2EB',
                                    '#FFCE56',
                                    '#4BC0C0',
                                    '#9966FF'
                                  ]
                                }]
                              }}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                  },
                                  title: {
                                    display: true,
                                    text: 'Wastage by Category'
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return context.label + ': Rs. ' + context.parsed.toLocaleString();
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="chart-placeholder">
                              <p>🥧 No wastage data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "income" && (
                  <div ref={incomeRef}>
                    <div className="section-header">
                      <h2>💰 Income Tracking Report</h2>
                      <div className="export-buttons">
                        <button className="export-btn" onClick={exportIncomeToPDF}>📄 Export PDF</button>
                        <button className="export-btn" onClick={exportIncomeToExcel}>📊 Export Excel</button>
                      </div>
                    </div>

                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Total Revenue</h3>
                        <div className="summary-value">Rs. {(financeData.summary.totalIncome || 0).toLocaleString()}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Average Transaction</h3>
                        <div className="summary-value">
                          Rs. {financeData.summary.counts?.incomeCount > 0
                            ? (financeData.summary.totalIncome / financeData.summary.counts.incomeCount).toLocaleString()
                            : '0'}
                        </div>
                      </div>
                      <div className="summary-card">
                        <h3>Total Transactions</h3>
                        <div className="summary-value">{financeData.summary.counts?.incomeCount || 0}</div>
                      </div>
                    </div>

                    <div className="table-card">
                      <h3>Recent Income Transactions</h3>
                      <div className="table-container">
                        <table className="reports-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Source</th>
                              <th>Description</th>
                              <th>Total Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financeData.tables?.recentIncomes?.map((income) => (
                              <tr key={income._id}>
                                <td>{new Date(income.incomeDate).toLocaleDateString()}</td>
                                <td>{income.category}</td>
                                <td>{income.description}</td>
                                <td>Rs. {(income.quantity * income.unitPrice).toLocaleString()}</td>
                              </tr>
                            )) || (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                                    No income data available for the selected period
                                  </td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "expense" && (
                  <div ref={expenseRef}>
                    <div className="section-header">
                      <h2>💸 Expense Tracking Report</h2>
                      <div className="export-buttons">
                        <button className="export-btn" onClick={exportExpenseToPDF}>📄 Export PDF</button>
                        <button className="export-btn" onClick={exportExpenseToExcel}>📊 Export Excel</button>
                      </div>
                    </div>

                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Total Expenses</h3>
                        <div className="summary-value">Rs. {(financeData.summary.totalExpenses || 0).toLocaleString()}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Average Transaction</h3>
                        <div className="summary-value">
                          Rs. {financeData.summary.counts?.expenseCount > 0
                            ? (financeData.summary.totalExpenses / financeData.summary.counts.expenseCount).toLocaleString()
                            : '0'}
                        </div>
                      </div>
                      <div className="summary-card">
                        <h3>Total Transactions</h3>
                        <div className="summary-value">{financeData.summary.counts?.expenseCount || 0}</div>
                      </div>
                    </div>

                    <div className="table-card">
                      <h3>Recent Expense Transactions</h3>
                      <div className="table-container">
                        <table className="reports-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Category</th>
                              <th>Description</th>
                              <th>Amount (Rs)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financeData.tables?.recentExpenses?.map((expense) => (
                              <tr key={expense._id}>
                                <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                <td>{expense.category}</td>
                                <td>{expense.description}</td>
                                <td>Rs. {expense.amount.toLocaleString()}</td>
                              </tr>
                            )) || (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                                    No expense data available for the selected period
                                  </td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "wastage" && (
                  <div ref={wastageRef}>
                    <div className="section-header">
                      <h2>🗑️ Wastage Cost Estimation Report</h2>
                      <div className="export-buttons">
                        <button className="export-btn" onClick={exportWastageToPDF}>📄 Export PDF</button>
                        <button className="export-btn" onClick={exportWastageToExcel}>📊 Export Excel</button>
                      </div>
                    </div>

                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Total Wastage Cost</h3>
                        <div className="summary-value">Rs. {(financeData.summary.totalWastage || 0).toLocaleString()}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Wastage % of Expenses</h3>
                        <div className="summary-value">{(financeData.summary.wastagePercentage || 0).toFixed(1)}%</div>
                      </div>
                      <div className="summary-card">
                        <h3>Wastage Records</h3>
                        <div className="summary-value">{financeData.summary.counts?.wastageCount || 0}</div>
                      </div>
                    </div>

                    <div className="table-card">
                      <h3>Wastage by Category</h3>
                      <div className="table-container">
                        <table className="reports-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Total Cost (Rs)</th>
                              <th>Records</th>
                              <th>% of Total Wastage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financeData.charts?.wastageBreakdown?.length > 0 ? (
                              financeData.charts.wastageBreakdown.map((item) => (
                                <tr key={item._id}>
                                  <td>{item._id}</td>
                                  <td>Rs. {item.totalValue.toLocaleString()}</td>
                                  <td>{item.count}</td>
                                  <td>{((item.totalValue / financeData.summary.totalWastage) * 100).toFixed(1)}%</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                                  No wastage data available for the selected period
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profitMargin" && (
                  <div ref={profitMarginRef}>
                    <div className="section-header">
                      <h2>📊 Profit Margin Analysis Report</h2>
                      <div className="export-buttons">
                        <button className="export-btn" onClick={exportProfitMarginToPDF}>📄 Export PDF</button>
                        <button className="export-btn" onClick={exportProfitMarginToExcel}>📊 Export Excel</button>
                      </div>
                    </div>

                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Current Profit Margin</h3>
                        <div className="summary-value">{(financeData.summary.profitMargin || 0).toFixed(1)}%</div>
                      </div>
                      <div className="summary-card">
                        <h3>Net Profit/Loss</h3>
                        <div className="summary-value">Rs. {(financeData.summary.profit || 0).toLocaleString()}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Revenue Efficiency</h3>
                        <div className="summary-value">
                          {financeData.summary.profitMargin >= 20 ? 'Excellent' :
                            financeData.summary.profitMargin >= 10 ? 'Good' :
                              financeData.summary.profitMargin >= 0 ? 'Needs Improvement' : 'Critical'}
                        </div>
                      </div>
                    </div>

                    <div className="table-card">
                      <h3>Profit Margin Breakdown</h3>
                      <div className="table-container">
                        <table className="reports-table">
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>Amount (Rs)</th>
                              <th>Percentage</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Total Revenue</td>
                              <td>Rs. {(financeData.summary.totalIncome || 0).toLocaleString()}</td>
                              <td>100%</td>
                              <td>✅ Base</td>
                            </tr>
                            <tr>
                              <td>Total Expenses</td>
                              <td>Rs. {(financeData.summary.totalExpenses || 0).toLocaleString()}</td>
                              <td>{((financeData.summary.totalExpenses / financeData.summary.totalIncome) * 100).toFixed(1)}%</td>
                              <td>📊 Cost</td>
                            </tr>
                            <tr>
                              <td>Wastage Cost</td>
                              <td>Rs. {(financeData.summary.totalWastage || 0).toLocaleString()}</td>
                              <td>{((financeData.summary.totalWastage / financeData.summary.totalIncome) * 100).toFixed(1)}%</td>
                              <td>⚠️ Loss</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                              <td>Net Profit/Loss</td>
                              <td>Rs. {(financeData.summary.profit || 0).toLocaleString()}</td>
                              <td>{(financeData.summary.profitMargin || 0).toFixed(1)}%</td>
                              <td>{(financeData.summary.profit >= 0 ? '✅ Profit' : '❌ Loss')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "breakEven" && (
                  <div ref={breakEvenRef}>
                    <div className="section-header">
                      <h2>⚖️ Break-even Analysis Report</h2>
                      <div className="export-buttons">
                        <button className="export-btn" onClick={exportBreakEvenToPDF}>📄 Export PDF</button>
                        <button className="export-btn" onClick={exportBreakEvenToExcel}>📊 Export Excel</button>
                      </div>
                    </div>

                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Break-even Units</h3>
                        <div className="summary-value">{(financeData.summary.breakEvenUnits || 0).toLocaleString()}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Average Unit Price</h3>
                        <div className="summary-value">Rs. {(financeData.summary.avgUnitPrice || 0).toFixed(0)}</div>
                      </div>
                      <div className="summary-card">
                        <h3>Average Unit Cost</h3>
                        <div className="summary-value">Rs. {(financeData.summary.avgUnitCost || 0).toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="table-card">
                      <h3>Break-even Analysis Details</h3>
                      <div className="table-container">
                        <table className="reports-table">
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th>Amount (Rs)</th>
                              <th>Calculation</th>
                              <th>Impact</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Total Revenue</td>
                              <td>Rs. {(financeData.summary.totalIncome || 0).toLocaleString()}</td>
                              <td>Sum of all sales</td>
                              <td>📈 Positive</td>
                            </tr>
                            <tr>
                              <td>Total Expenses</td>
                              <td>Rs. {(financeData.summary.totalExpenses || 0).toLocaleString()}</td>
                              <td>Operating costs</td>
                              <td>📉 Negative</td>
                            </tr>
                            <tr>
                              <td>Wastage Cost</td>
                              <td>Rs. {(financeData.summary.totalWastage || 0).toLocaleString()}</td>
                              <td>Lost inventory value</td>
                              <td>⚠️ Negative</td>
                            </tr>
                            <tr>
                              <td>Total Units Sold</td>
                              <td>{financeData.tables?.recentIncomes?.reduce((sum, income) => sum + income.quantity, 0) || 0}</td>
                              <td>Sum of quantities</td>
                              <td>📊 Volume</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                              <td>Break-even Point</td>
                              <td>{(financeData.summary.breakEvenUnits || 0).toLocaleString()} units</td>
                              <td>Fixed costs ÷ (Price - Variable cost)</td>
                              <td>🎯 Target</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Reports;