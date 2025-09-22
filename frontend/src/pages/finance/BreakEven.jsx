import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import './BreakEven.css';

const FRUIT_PROCESSING_DATA = {
  'jackfruit': {
    name: 'Jackfruit',
    fixedCosts: 250000,
    variableCosts: 75,
    unitPrice: 150,
    wastagePercentage: 15,
    description: 'Large fruit processing with high equipment costs'
  },
  'woodapple': {
    name: 'Wood Apple',
    fixedCosts: 180000,
    variableCosts: 45,
    unitPrice: 95,
    wastagePercentage: 12,
    description: 'Medium-sized fruit with moderate processing requirements'
  },
  'durian': {
    name: 'Durian',
    fixedCosts: 350000,
    variableCosts: 120,
    unitPrice: 280,
    wastagePercentage: 18,
    description: 'Premium fruit with high processing costs'
  },
  'banana': {
    name: 'Banana',
    fixedCosts: 150000,
    variableCosts: 30,
    unitPrice: 65,
    wastagePercentage: 10,
    description: 'High-volume fruit with low processing costs'
  },
  'mango': {
    name: 'Mango',
    fixedCosts: 220000,
    variableCosts: 60,
    unitPrice: 130,
    wastagePercentage: 14,
    description: 'Seasonal fruit with moderate processing needs'
  }
};

const BreakEven = () => {
  const [selectedFruit, setSelectedFruit] = useState('');
  const [productionData, setProductionData] = useState({
    fixedCosts: 0,
    variableCosts: 0,
    unitPrice: 0,
    wastagePercentage: 0,
    productionVolume: 0
  });

  // Load default values when fruit is selected
  const handleFruitSelection = (fruitKey) => {
    if (fruitKey && FRUIT_PROCESSING_DATA[fruitKey]) {
      const fruitData = FRUIT_PROCESSING_DATA[fruitKey];
      setSelectedFruit(fruitKey);
      setProductionData({
        fixedCosts: fruitData.fixedCosts,
        variableCosts: fruitData.variableCosts,
        unitPrice: fruitData.unitPrice,
        wastagePercentage: fruitData.wastagePercentage,
        productionVolume: 0
      });
    }
  };

  const [breakEvenPoint, setBreakEvenPoint] = useState({
    units: 0,
    revenue: 0
  });

  // Calculate break-even point
  const calculateBreakEven = () => {
    const {
      fixedCosts,
      variableCosts,
      unitPrice,
      wastagePercentage
    } = productionData;

    // Adjust costs considering wastage
    const effectiveUnitPrice = unitPrice * (1 - wastagePercentage / 100);
    const effectiveVariableCost = variableCosts / (1 - wastagePercentage / 100);
    
    // Break-even units = Fixed Costs / (Unit Price - Variable Cost per Unit)
    const breakEvenUnits = fixedCosts / (effectiveUnitPrice - effectiveVariableCost);
    const breakEvenRevenue = breakEvenUnits * effectiveUnitPrice;

    setBreakEvenPoint({
      units: Math.ceil(breakEvenUnits),
      revenue: breakEvenRevenue
    });
  };

  // Generate chart data
  const generateChartData = () => {
    const maxUnits = breakEvenPoint.units * 2;
    const unitSteps = Math.ceil(maxUnits / 10);
    const units = Array.from({ length: 11 }, (_, i) => i * unitSteps);

    const totalCostLine = units.map(unit => ({
      x: unit,
      y: productionData.fixedCosts + (unit * productionData.variableCosts)
    }));

    const revenueLine = units.map(unit => ({
      x: unit,
      y: unit * productionData.unitPrice * (1 - productionData.wastagePercentage / 100)
    }));

    return {
      labels: units,
      datasets: [
        {
          label: 'Total Cost',
          data: totalCostLine,
          borderColor: 'rgb(255, 99, 132)',
          fill: false
        },
        {
          label: 'Revenue',
          data: revenueLine,
          borderColor: 'rgb(75, 192, 192)',
          fill: false
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Break-Even Analysis'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: Rs. ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Production Units'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount (Rs)'
        }
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductionData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Effect to recalculate when inputs change
  useEffect(() => {
    calculateBreakEven();
  }, [productionData]);

  return (
    <div className="break-even-container">
      <div className="input-section">
        <h2>Break-Even Analysis</h2>
        
        {/* Fruit Selection */}
        <div className="fruit-selection">
          <label>Select Fruit Type</label>
          <select 
            value={selectedFruit} 
            onChange={(e) => handleFruitSelection(e.target.value)}
          >
            <option value="">Select a fruit</option>
            {Object.entries(FRUIT_PROCESSING_DATA).map(([key, fruit]) => (
              <option key={key} value={key}>{fruit.name}</option>
            ))}
          </select>
          
          {selectedFruit && (
            <div className="fruit-description">
              {FRUIT_PROCESSING_DATA[selectedFruit].description}
            </div>
          )}
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label>Fixed Costs (Rs)</label>
            <input
              type="number"
              name="fixedCosts"
              value={productionData.fixedCosts}
              onChange={handleInputChange}
              placeholder="Enter fixed costs"
            />
          </div>
          <div className="input-group">
            <label>Variable Costs per Unit (Rs)</label>
            <input
              type="number"
              name="variableCosts"
              value={productionData.variableCosts}
              onChange={handleInputChange}
              placeholder="Enter variable costs per unit"
            />
          </div>
          <div className="input-group">
            <label>Unit Price (Rs)</label>
            <input
              type="number"
              name="unitPrice"
              value={productionData.unitPrice}
              onChange={handleInputChange}
              placeholder="Enter unit price"
            />
          </div>
          <div className="input-group">
            <label>Expected Wastage (%)</label>
            <input
              type="number"
              name="wastagePercentage"
              value={productionData.wastagePercentage}
              onChange={handleInputChange}
              placeholder="Enter expected wastage percentage"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="break-even-summary">
          <div className="summary-card">
            <h3>Break-Even Point</h3>
            <p>Units: {breakEvenPoint.units.toLocaleString()}</p>
            <p>Revenue: Rs. {breakEvenPoint.revenue.toFixed(2).toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Profit/Loss Analysis</h3>
            <p>Contribution Margin: Rs. {(productionData.unitPrice - productionData.variableCosts).toFixed(2)}</p>
            <p>Margin Ratio: {((productionData.unitPrice - productionData.variableCosts) / productionData.unitPrice * 100 || 0).toFixed(2)}%</p>
          </div>
        </div>

        <div className="chart-section">
          <Line data={generateChartData()} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default BreakEven;
