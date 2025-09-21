import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnalyticsChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics/sales');
        setSalesData(res.data.salesData);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (loading) return <p>Loading sales chart...</p>;

  // Transform API data to chart format
  const labels = salesData.map(item => `${item._id.day}/${item._id.month}/${item._id.year}`);
  const data = {
    labels,
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData.map(item => item.totalSales),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Sales Chart' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sales Analytics</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default AnalyticsChart;
