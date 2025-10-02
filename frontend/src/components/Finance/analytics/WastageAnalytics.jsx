import React, { useState, useEffect, useRef } from 'react';
import { WastageTimeTrend, WastageCategoryChart, FruitWiseWastageChart } from '../charts/WastageCharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './WastageAnalytics.css';

const TIME_PERIODS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
};

export default function WastageAnalytics({ wastageRecords }) {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filteredData, setFilteredData] = useState(wastageRecords);

  // Filter data based on date range and time frame
  useEffect(() => {
    const filtered = wastageRecords.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return recordDate >= startDate && recordDate <= endDate;
    });

    setFilteredData(filtered);
  }, [wastageRecords, dateRange, timeFrame]);

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!filteredData.length) return { totalCost: 0, totalQuantity: 0, avgCost: 0 };

    const totalCost = filteredData.reduce((sum, record) => 
      sum + (record.quantity * record.unitPrice), 0);
    const totalQuantity = filteredData.reduce((sum, record) => 
      sum + record.quantity, 0);

    return {
      totalCost,
      totalQuantity,
      avgCost: totalCost / totalQuantity
    };
  };

  const summary = calculateSummary();
  const dashboardRef = useRef(null);
  const chartsRef = useRef(null);

  // Function to export individual chart as image
  const exportChartAsImage = async (chartRef, chartName) => {
    try {
      const canvas = await html2canvas(chartRef);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartName}-${new Date().toLocaleDateString()}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  // Function to generate PDF report
  const generatePDFReport = async () => {
    try {
      const dashboard = dashboardRef.current;
      const canvas = await html2canvas(dashboard);
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Wastage Analysis Report', pageWidth/2, 15, { align: 'center' });
      
      // Add date range
      pdf.setFontSize(12);
      pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, pageWidth/2, 25, { align: 'center' });
      
      // Add summary statistics
      pdf.setFontSize(14);
      pdf.text('Summary', 15, 40);
      pdf.setFontSize(10);
      pdf.text(`Total Wastage Cost: Rs. ${summary.totalCost.toFixed(2)}`, 20, 50);
      pdf.text(`Total Quantity Wasted: ${summary.totalQuantity.toFixed(2)} kg`, 20, 57);
      pdf.text(`Average Cost per kg: Rs. ${summary.avgCost.toFixed(2)}`, 20, 64);
      
      // Add charts
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 75, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`WastageReport-${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="analytics-dashboard" ref={dashboardRef}>
      <div className="analytics-controls">
        <div className="export-controls">
          <button onClick={generatePDFReport} className="export-btn">
            Export as PDF
          </button>
        </div>
        <div className="time-controls">
          <div className="period-selector">
            <label>Time Period:</label>
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              {Object.entries(TIME_PERIODS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="date-range">
            <div className="date-input">
              <label>From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="date-input">
              <label>To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Total Wastage Cost</h3>
            <div className="value">Rs. {summary.totalCost.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h3>Total Quantity Wasted</h3>
            <div className="value">{summary.totalQuantity.toFixed(2)} kg</div>
          </div>
          <div className="summary-card">
            <h3>Average Cost per kg</h3>
            <div className="value">Rs. {summary.avgCost.toFixed(2)}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid" ref={chartsRef}>
          <div className="chart-container">
            <div className="chart-header">
              <h4 className="chart-title">Wastage Trends Over Time</h4>
              <button 
                className="export-chart-btn"
                onClick={() => exportChartAsImage(chartsRef.current.children[0], 'WastageTrends')}
              >
                Export Chart
              </button>
            </div>
            <WastageTimeTrend wastageData={filteredData} timeFrame={timeFrame} />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h4 className="chart-title">Wastage by Category</h4>
              <button 
                className="export-chart-btn"
                onClick={() => exportChartAsImage(chartsRef.current.children[1], 'WastageByCategory')}
              >
                Export Chart
              </button>
            </div>
            <WastageCategoryChart wastageData={filteredData} />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h4 className="chart-title">Wastage by Fruit Type</h4>
              <button 
                className="export-chart-btn"
                onClick={() => exportChartAsImage(chartsRef.current.children[2], 'WastageByFruit')}
              >
                Export Chart
              </button>
            </div>
            <FruitWiseWastageChart wastageData={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
}