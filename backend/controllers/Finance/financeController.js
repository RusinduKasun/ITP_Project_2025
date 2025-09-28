import Income from "../../models/Finance/Income.js";
import Expense from "../../models/Finance/Expense.js";
import Wastage from "../../models/Finance/Wastage.js";
import mongoose from "mongoose";

// Get comprehensive finance summary
export const getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filters for different collections
    const incomeDateFilter = {};
    const expenseDateFilter = {};
    const wastageDateFilter = {};
    
    if (startDate && endDate) {
      incomeDateFilter.incomeDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      expenseDateFilter.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      wastageDateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          totalWastage: 0,
          profit: 0,
          profitMargin: 0,
          wastagePercentage: 0,
          breakEvenUnits: 0,
          avgUnitPrice: 0,
          avgUnitCost: 0
        },
        charts: {
          monthlyData: [],
          monthlyExpenses: [],
          wastageBreakdown: []
        },
        tables: {
          recentIncomes: [],
          recentExpenses: [],
          topProducts: []
        },
        insights: [{
          type: "warning",
          icon: "⚠️",
          message: "Database connection not available. Please check your MongoDB connection."
        }],
        counts: {
          incomeCount: 0,
          expenseCount: 0,
          wastageCount: 0
        }
      });
    }

    // Get aggregated data in parallel
    const [incomeData, expenseData, wastageData, recentIncomes, recentExpenses] = await Promise.all([
      // Total Income
      Income.aggregate([
        { $match: incomeDateFilter },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total Expenses
      Expense.aggregate([
        { $match: expenseDateFilter },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total Wastage
      Wastage.aggregate([
        { $match: wastageDateFilter },
        {
          $group: {
            _id: null,
            totalWastage: { $sum: "$wastageCost" },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent Incomes (last 10)
      Income.find(incomeDateFilter)
        .sort({ incomeDate: -1 })
        .limit(10)
        .select('incomeDate description category quantity unitPrice referenceNumber'),
        
      // Recent Expenses (last 10)
      Expense.find(expenseDateFilter)
        .sort({ expenseDate: -1 })
        .limit(10)
        .select('expenseDate description category amount financeManager')
    ]);

    // Extract totals
    const totalIncome = incomeData[0]?.totalIncome || 0;
    const totalExpenses = expenseData[0]?.totalExpenses || 0;
    const totalWastage = wastageData[0]?.totalWastage || 0;
    
    // Calculate derived metrics
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    const wastagePercentage = totalExpenses > 0 ? (totalWastage / totalExpenses) * 100 : 0;

    // Monthly breakdown for charts
    const monthlyData = await Income.aggregate([
      { $match: incomeDateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$incomeDate" },
            month: { $month: "$incomeDate" }
          },
          income: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $match: expenseDateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" }
          },
          expenses: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Wastage breakdown by reason
    const wastageBreakdown = await Wastage.aggregate([
      { $match: wastageDateFilter },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: "$wastageCost" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top products by revenue
    const topProducts = await Income.aggregate([
      { $match: incomeDateFilter },
      {
        $group: {
          _id: "$productType",
          totalRevenue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Generate insights and alerts
    const insights = [];
    
    if (wastagePercentage > 15) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        message: `Wastage cost exceeded 15% of expenses (${wastagePercentage.toFixed(1)}%)`
      });
    }
    
    if (profitMargin > 20) {
      insights.push({
        type: "success",
        icon: "✅",
        message: `Excellent profit margin of ${profitMargin.toFixed(1)}%`
      });
    } else if (profitMargin < 10) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        message: `Low profit margin of ${profitMargin.toFixed(1)}% - consider cost optimization`
      });
    }
    
    if (profit > 0) {
      insights.push({
        type: "success",
        icon: "📈",
        message: `Profitable operations with Rs. ${profit.toLocaleString()} profit`
      });
    } else {
      insights.push({
        type: "error",
        icon: "📉",
        message: `Operating at a loss of Rs. ${Math.abs(profit).toLocaleString()}`
      });
    }

    // Calculate break-even point
    const avgUnitPrice = totalIncome / (incomeData[0]?.count || 1);
    const avgUnitCost = totalExpenses / (incomeData[0]?.count || 1);
    const breakEvenUnits = avgUnitCost > 0 ? Math.ceil(totalExpenses / avgUnitPrice) : 0;

    const response = {
      summary: {
        totalIncome,
        totalExpenses,
        totalWastage,
        profit,
        profitMargin,
        wastagePercentage,
        breakEvenUnits,
        avgUnitPrice,
        avgUnitCost
      },
      charts: {
        monthlyData,
        monthlyExpenses,
        wastageBreakdown
      },
      tables: {
        recentIncomes,
        recentExpenses,
        topProducts
      },
      insights,
      counts: {
        incomeCount: incomeData[0]?.count || 0,
        expenseCount: expenseData[0]?.count || 0,
        wastageCount: wastageData[0]?.count || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    res.status(500).json({ 
      error: "Failed to fetch finance summary",
      details: error.message 
    });
  }
};

// Get break-even analysis
export const getBreakEvenAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.incomeDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const incomeData = await Income.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          totalQuantity: { $sum: "$quantity" },
          avgPrice: { $avg: "$unitPrice" }
        }
      }
    ]);

    const expenseData = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCosts: { $sum: "$amount" }
        }
      }
    ]);

    const revenue = incomeData[0]?.totalRevenue || 0;
    const quantity = incomeData[0]?.totalQuantity || 0;
    const avgPrice = incomeData[0]?.avgPrice || 0;
    const totalCosts = expenseData[0]?.totalCosts || 0;

    const breakEvenUnits = avgPrice > 0 ? Math.ceil(totalCosts / avgPrice) : 0;
    const breakEvenRevenue = breakEvenUnits * avgPrice;

    res.json({
      breakEvenUnits,
      breakEvenRevenue,
      currentUnits: quantity,
      currentRevenue: revenue,
      avgPrice,
      totalCosts,
      marginPerUnit: avgPrice - (totalCosts / quantity),
      isBreakEven: revenue >= breakEvenRevenue
    });
  } catch (error) {
    console.error("Error calculating break-even:", error);
    res.status(500).json({ 
      error: "Failed to calculate break-even analysis",
      details: error.message 
    });
  }
};
