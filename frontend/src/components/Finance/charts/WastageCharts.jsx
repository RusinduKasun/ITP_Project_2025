import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to group data by time period
const groupDataByPeriod = (data, timeFrame) => {
  const groupedData = {};
  
  data.forEach(record => {
    const date = new Date(record.date);
    let key;
    
    switch (timeFrame) {
      case 'weekly':
        // Get the monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        key = monday.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'daily':
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        totalCost: 0,
        quantity: 0,
      };
    }
    groupedData[key].totalCost += record.quantity * record.unitPrice;
    groupedData[key].quantity += record.quantity;
  });

  return groupedData;
};

// Time trend chart component
export const WastageTimeTrend = ({ wastageData, timeFrame = 'daily' }) => {
  // Process data for time-based visualization
  const processTimeData = () => {
    const timeData = groupDataByPeriod(wastageData, timeFrame);
    
    // Sort dates
    const sortedDates = Object.keys(timeData).sort();

    return {
      labels: sortedDates.map(date => {
        switch (timeFrame) {
          case 'weekly':
            return `Week of ${date}`;
          case 'monthly':
            return new Date(date + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
          default:
            return new Date(date).toLocaleDateString();
        }
      }),
      datasets: [
        {
          label: 'Wastage Cost (Rs)',
          data: Object.values(timeData).map(d => d.totalCost),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Quantity (kg)',
          data: Object.values(timeData).map(d => d.quantity),
          borderColor: 'rgb(53, 162, 235)',
          tension: 0.1
        }
      ]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wastage Trends Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-container">
      <Line data={processTimeData()} options={options} />
    </div>
  );
};

// Category distribution chart
export const WastageCategoryChart = ({ wastageData }) => {
  const processCategoryData = () => {
    const categoryData = {};
    wastageData.forEach(record => {
      if (!categoryData[record.category]) {
        categoryData[record.category] = {
          cost: 0,
          quantity: 0
        };
      }
      categoryData[record.category].cost += record.quantity * record.unitPrice;
      categoryData[record.category].quantity += record.quantity;
    });

    const backgroundColors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)'
    ];

    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: 'Cost by Category',
          data: Object.values(categoryData).map(d => d.cost),
          backgroundColor: backgroundColors
        }
      ]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wastage Distribution by Category'
      }
    }
  };

  return (
    <div className="chart-container">
      <Pie data={processCategoryData()} options={options} />
    </div>
  );
};

// Fruit-wise wastage chart
export const FruitWiseWastageChart = ({ wastageData }) => {
  const processFruitData = () => {
    const fruitData = {};
    wastageData.forEach(record => {
      if (!fruitData[record.fruitType]) {
        fruitData[record.fruitType] = {
          cost: 0,
          quantity: 0
        };
      }
      fruitData[record.fruitType].cost += record.quantity * record.unitPrice;
      fruitData[record.fruitType].quantity += record.quantity;
    });

    return {
      labels: Object.keys(fruitData),
      datasets: [
        {
          label: 'Wastage Cost by Fruit Type',
          data: Object.values(fruitData).map(d => d.cost),
          backgroundColor: 'rgba(53, 162, 235, 0.5)'
        }
      ]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wastage by Fruit Type'
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={processFruitData()} options={options} />
    </div>
  );
};