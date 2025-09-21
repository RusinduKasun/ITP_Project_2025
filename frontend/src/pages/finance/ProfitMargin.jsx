import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

import './ProfitMargin.css';

const ProfitMargin = () => {
  const [profitData, setProfitData] = useState({
    revenues: [],
    expenses: [],
    margins: [],
    labels: []
  });

  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState('all');
  
  // Convert product type to lowercase to match backend model
  const normalizeProductType = (product) => {
    return product === 'all' ? product : product.toLowerCase();
  };
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Calculate profit margins
  const calculateMargins = (revenues, expenses) => {
    console.log('Calculating margins for:', { revenues, expenses });
    if (!revenues || !revenues.length) {
      console.log('No revenue data, returning zero margins');
      return { grossMargin: 0, operatingMargin: 0, netMargin: 0 };
    }
    
    // Calculate total revenue from quantity * unitPrice for each record
    const totalRevenue = revenues.reduce((total, income) => {
      return total + (parseFloat(income.quantity || 0) * parseFloat(income.unitPrice || 0));
    }, 0);

    // Sum up all expenses
    const totalExpenses = expenses.reduce((total, expense) => {
      return total + parseFloat(expense.amount || 0);
    }, 0);

    console.log('Calculated totals:', { totalRevenue, totalExpenses });
    
    const grossMargin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;
    return {
      grossMargin,
      operatingMargin: grossMargin * 0.85, // Approximate after operating expenses
      netMargin: grossMargin * 0.7 // Approximate after all deductions
    };
  };

  // Fetch data
  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        console.log('Fetching data with params:', { dateRange, selectedProduct });
        const [incomesRes, expensesRes] = await Promise.all([
          axios.get(`/api/incomes?startDate=${dateRange.start}&endDate=${dateRange.end}&product=${normalizeProductType(selectedProduct)}`),
          axios.get(`/api/expenses?startDate=${dateRange.start}&endDate=${dateRange.end}&product=${normalizeProductType(selectedProduct)}`)
        ]);
        
        console.log('API Response:', JSON.stringify({
          incomes: incomesRes.data,
          expenses: expensesRes.data
        }, null, 2));

        // Process and aggregate data
        const processedData = processFinancialData(
          Array.isArray(incomesRes.data) ? incomesRes.data : incomesRes.data.data || [],
          Array.isArray(expensesRes.data) ? expensesRes.data : expensesRes.data.data || [],
          timeframe,
          selectedProduct
        );
        
        console.log('Processed Data:', JSON.stringify(processedData, null, 2));

        setProfitData(processedData);
      } catch (error) {
        console.error('Error fetching profit data:', error);
      }
    };

    fetchProfitData();
  }, [timeframe, selectedProduct, dateRange]);

  // Group data by timeframe
  const groupByTimeframe = (data, timeframe) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.date);
      let key;

      switch (timeframe) {
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
          break;
        default: // daily
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.amount;
      return acc;
    }, {});
  };

  // Process financial data based on timeframe and product
  const processFinancialData = (incomes, expenses, timeframe, product) => {
    // Filter by date range and product
    const filterData = (data) => {
      return data.filter(item => {
        const itemDate = new Date(item.incomeDate || item.expenseDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        // Set time to midnight for accurate date comparison
        itemDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return itemDate >= startDate && 
               itemDate <= endDate && 
               (product === 'all' || item.productType === product);
      });
    };

    const filteredIncomes = filterData(incomes);
    const filteredExpenses = filterData(expenses);
    
    console.log('Filtered Data:', JSON.stringify({
      incomes: filteredIncomes,
      expenses: filteredExpenses,
      dateRange,
      product
    }, null, 2));

    // Group data by timeframe
    const groupedIncomes = {};
    const groupedExpenses = {};

    filteredIncomes.forEach(income => {
      const date = new Date(income.incomeDate);
      if (isNaN(date.getTime())) {
        console.log('Invalid date in income:', income);
        return;
      }
      let key;
      switch (timeframe) {
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      if (!groupedIncomes[key]) groupedIncomes[key] = [];
      groupedIncomes[key].push(income);
    });

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.expenseDate);
      let key;
      switch (timeframe) {
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      if (!groupedExpenses[key]) groupedExpenses[key] = [];
      groupedExpenses[key].push(expense);
    });

    // Get all unique dates
    const allDates = [...new Set([
      ...Object.keys(groupedIncomes),
      ...Object.keys(groupedExpenses)
    ])].sort();

    console.log('Grouped Data:', {
      timeframe,
      product,
      groupedIncomes,
      groupedExpenses,
      allDates
    });

    // Calculate revenues and expenses arrays
    const revenueAmounts = allDates.map(date => {
      const incomes = groupedIncomes[date] || [];
      return incomes.reduce((total, income) => total + (income.quantity * income.unitPrice), 0);
    });

    const calculatedExpenses = allDates.map(date => {
      const periodExpenses = groupedExpenses[date] || [];
      return periodExpenses.reduce((total, expense) => total + expense.amount, 0);
    });

    // Calculate margins for each period
    const margins = allDates.map(date => calculateMargins(
      groupedIncomes[date] || [],
      groupedExpenses[date] || []
    ));

    return {
      labels: allDates,
      revenues: revenueAmounts,
      expenses: calculatedExpenses,
      margins
    };
  };

  // Chart configurations
  const marginChartConfig = {
    labels: profitData.labels,
    datasets: [
      {
        label: 'Gross Margin',
        data: profitData.margins.map(m => m.grossMargin),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Net Margin',
        data: profitData.margins.map(m => m.netMargin),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const revenueExpenseChartConfig = {
    labels: profitData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: profitData.revenues,
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'Expenses',
        data: profitData.expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  return (
    <div className="profit-margin-container">
      <div className="controls-section">
        <h2>Profit Margin Analysis</h2>
        
        <div className="filters">
          <div className="filter-group">
            <label>Time Frame</label>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Product</label>
            <select 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="jackfruit">Jackfruit</option>
              <option value="woodapple">Wood Apple</option>
              <option value="durian">Durian</option>
              <option value="banana">Banana</option>
            </select>
          </div>

          <div className="date-range">
            <div className="filter-group">
              <label>From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-cards">
        <div className="metric-card">
          <h3>Gross Profit Margin</h3>
          <div className="value">
            {profitData.margins.length > 0 
              ? `${profitData.margins[profitData.margins.length - 1].grossMargin.toFixed(2)}%`
              : '0%'
            }
          </div>
        </div>
        <div className="metric-card">
          <h3>Operating Margin</h3>
          <div className="value">
            {profitData.margins.length > 0
              ? `${profitData.margins[profitData.margins.length - 1].operatingMargin.toFixed(2)}%`
              : '0%'
            }
          </div>
        </div>
        <div className="metric-card">
          <h3>Net Profit Margin</h3>
          <div className="value">
            {profitData.margins.length > 0
              ? `${profitData.margins[profitData.margins.length - 1].netMargin.toFixed(2)}%`
              : '0%'
            }
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Margin Trends</h3>
          <Line data={marginChartConfig} options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Profit Margins Over Time'
              }
            }
          }} />
        </div>

        <div className="chart-container">
          <h3>Revenue vs Expenses</h3>
          <Bar data={revenueExpenseChartConfig} options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Revenue and Expenses Comparison'
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default ProfitMargin;
