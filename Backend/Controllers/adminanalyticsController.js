const AdminOrder = require("../Model/adminOrder");

// Daily / Weekly / Monthly Sales
exports.getSalesData = async (req, res) => {
  try {
  const salesData = await AdminOrder.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } }
    ]);

    res.json({ salesData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales data", error: error.message });
  }
};

// Top-Selling Products
exports.getTopProducts = async (req, res) => {
  try {
  const topProducts = await AdminOrder.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching top products", error: error.message });
  }
};
