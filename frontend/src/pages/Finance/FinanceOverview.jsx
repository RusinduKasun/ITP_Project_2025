import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FinanceOverview.css";
import Header from "../../components/Finance/layout/Header";
import Sidebar from "../../components/Finance/layout/Sidebar";
const FinanceOverview = ({ embedded = false }) => {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // Date filter options
  const dateFilterOptions = [
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisQuarter", label: "This Quarter" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
    { value: "custom", label: "Custom Range" }
  ];

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
      case "thisQuarter":
        const quarterStart = Math.floor(month / 3) * 3;
        return {
          startDate: new Date(year, quarterStart, 1).toISOString().split('T')[0],
          endDate: new Date(year, quarterStart + 3, 0).toISOString().split('T')[0]
        };
      case "thisYear":
        return {
          startDate: new Date(year, 0, 1).toISOString().split('T')[0],
          endDate: new Date(year, 11, 31).toISOString().split('T')[0]
        };
      case "lastYear":
        return {
          startDate: new Date(year - 1, 0, 1).toISOString().split('T')[0],
          endDate: new Date(year - 1, 11, 31).toISOString().split('T')[0]
        };
      case "custom":
        return customDateRange;
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
  }, [dateFilter, customDateRange]);

  // Updated KPI Card design to match the example
  const KPICard = ({ title, value, icon, color, subtitle }) => (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  // Insight Alert Component
  const InsightAlert = ({ insight }) => (
    <div className={`insight-alert ${insight.type}`}>
      <span className="insight-icon">{insight.icon}</span>
      <span className="insight-message">{insight.message}</span>
    </div>
  );

  // compact loading / error UI when embedded inside admin
  if (loading) {
    if (embedded) return <div className="py-6 text-center">Loading finance data...</div>;
    return (
      <div className="finance-overview">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading finance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    if (embedded) return (
      <div className="py-6 text-center text-red-600">
        <div>{error}</div>
        <button onClick={fetchFinanceData} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
    return (
      <div className="finance-overview">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={fetchFinanceData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // safe destructure so missing fields from the API don't crash the UI
  const { summary = {}, charts = {}, tables = {}, insights = [] } = financeData || {};
  const safeCharts = {
    monthlyData: Array.isArray(charts.monthlyData) ? charts.monthlyData : [],
    wastageBreakdown: Array.isArray(charts.wastageBreakdown) ? charts.wastageBreakdown : [],
    ...charts
  };
  const safeTables = {
    recentIncomes: Array.isArray(tables.recentIncomes) ? tables.recentIncomes : [],
    recentExpenses: Array.isArray(tables.recentExpenses) ? tables.recentExpenses : [],
    topProducts: Array.isArray(tables.topProducts) ? tables.topProducts : [],
    ...tables
  };
  const counts = summary.counts || {};

  const fmtRs = (v) => (v == null ? 'Rs. 0' : `Rs. ${Number(v).toLocaleString()}`);
  const fmtNum = (v) => (v == null ? 0 : v);
  const wastagePercentage = Number(summary.wastagePercentage || 0);

  // extract the main content so we can render it either embedded or inside the full layout
  const renderContent = () => (
    <div className="finance-overview">
      {/* Header */}
      <div className="overview-header">
        <h1>📈 Finance Management Overview</h1>
        <div className="date-filter-section">
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

          {dateFilter === "custom" && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({
                  ...prev,
                  endDate: e.target.value
                }))}
                className="date-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <KPICard
          title="Total Income"
          value={fmtRs(summary.totalIncome)}
          icon="💰"
          color="income"
          subtitle={`${fmtNum(counts.incomeCount)} transactions`}
        />
        <KPICard
          title="Total Expenses"
          value={fmtRs(summary.totalExpenses)}
          icon="💸"
          color="expense"
          subtitle={`${fmtNum(counts.expenseCount)} transactions`}
        />
        <KPICard
          title="Net Profit"
          value={fmtRs(summary.profit)}
          icon="📈"
          color="profit"
          subtitle="Profitable"
        />
        <KPICard
          title="Profit Margin"
          value={`${(typeof summary.profitMargin === 'number' ? summary.profitMargin.toFixed(1) : '0.0')}%`}
          icon="📊"
          color="profit"
          subtitle="Excellent"
        />
        <KPICard
          title="Wastage Cost"
          value={fmtRs(summary.totalWastage)}
          icon="🗑️"
          color="warning"
          subtitle="119.6% of expenses"
        />
        <KPICard
          title="Break-even Units"
          value="10"
          icon="⚖️"
          color="neutral"
          subtitle="Avg price: Rs. 2847"
        />
      </div>

      {/* Insights & Alerts */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h2>💡 Insights & Alerts</h2>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <InsightAlert key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        <h2>📊 Financial Charts</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Monthly Income vs Expenses</h3>
            <div className="chart-placeholder">
              <p>📈 Chart will be implemented with Chart.js</p>
              <p>Monthly data points: {safeCharts.monthlyData.length}</p>
            </div>
          </div>

          <div className="chart-card">
            <h3>Wastage Distribution</h3>
            <div className="chart-placeholder">
              <p>🍇 Pie chart will show wastage by reason</p>
              <p>Categories: {safeCharts.wastageBreakdown.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="tables-section">
        <h2>📋 Recent Transactions</h2>
        <div className="tables-grid">
          {/* Recent Incomes Table */}
          <div className="table-card">
            <h3>Recent Income</h3>
            <div className="table-container">
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {safeTables.recentIncomes.map((income) => (
                    <tr key={income._id}>
                      <td>{new Date(income.incomeDate).toLocaleDateString()}</td>
                      <td>{income.category}</td>
                      <td>{income.description}</td>
                      <td>{(income.quantity * income.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Expenses Table */}
          <div className="table-card">
            <h3>Recent Expenses</h3>
            <div className="table-container">
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount (Rs)</th>
                    <th>Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {safeTables.recentExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td>{expense.category || "-"}</td>
                      <td>{expense.description}</td>
                      <td>{expense.amount.toLocaleString()}</td>
                      <td>{expense.financeManager || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // final render: embedded mode returns only the content; otherwise render with header/sidebar
  if (embedded) return renderContent();

  return (
    <div className="app-container">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default FinanceOverview;
