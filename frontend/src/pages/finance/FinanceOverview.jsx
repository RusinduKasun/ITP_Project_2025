import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FinanceOverview.css";

const FinanceOverview = () => {
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

  // KPI Card Component
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

  if (loading) {
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

  const { summary, charts, tables, insights } = financeData;

  return (
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
          value={`Rs. ${summary.totalIncome.toLocaleString()}`}
          icon="💰"
          color="income"
          subtitle={`${summary.counts.incomeCount} transactions`}
        />
        <KPICard
          title="Total Expenses"
          value={`Rs. ${summary.totalExpenses.toLocaleString()}`}
          icon="💸"
          color="expense"
          subtitle={`${summary.counts.expenseCount} transactions`}
        />
        <KPICard
          title="Profit / Loss"
          value={`Rs. ${summary.profit.toLocaleString()}`}
          icon={summary.profit >= 0 ? "📈" : "📉"}
          color={summary.profit >= 0 ? "profit" : "loss"}
          subtitle={summary.profit >= 0 ? "Profitable" : "Loss"}
        />
        <KPICard
          title="Profit Margin"
          value={`${summary.profitMargin.toFixed(1)}%`}
          icon="📊"
          color={summary.profitMargin >= 20 ? "profit" : summary.profitMargin >= 10 ? "warning" : "loss"}
          subtitle={summary.profitMargin >= 20 ? "Excellent" : summary.profitMargin >= 10 ? "Good" : "Needs Improvement"}
        />
        <KPICard
          title="Wastage Cost"
          value={`Rs. ${summary.totalWastage.toLocaleString()}`}
          icon="🗑️"
          color={summary.wastagePercentage > 15 ? "warning" : "neutral"}
          subtitle={`${summary.wastagePercentage.toFixed(1)}% of expenses`}
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
              <p>Monthly data points: {charts.monthlyData.length}</p>
            </div>
          </div>
          
          <div className="chart-card">
            <h3>Wastage Distribution</h3>
            <div className="chart-placeholder">
              <p>🥧 Pie chart will show wastage by reason</p>
              <p>Categories: {charts.wastageBreakdown.length}</p>
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
                  {tables.recentIncomes.map((income) => (
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
                  {tables.recentExpenses.map((expense) => (
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

      {/* Top Products Section */}
      {tables.topProducts.length > 0 && (
        <div className="top-products-section">
          <h2>🏆 Top Products by Revenue</h2>
          <div className="table-card">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue (Rs)</th>
                  <th>Quantity</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {tables.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product._id}</td>
                    <td>{product.totalRevenue.toLocaleString()}</td>
                    <td>{product.totalQuantity.toLocaleString()}</td>
                    <td>{product.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceOverview;
