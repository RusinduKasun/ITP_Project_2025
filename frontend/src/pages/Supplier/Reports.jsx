// Report.jsx
import React from 'react';
import { fetchOrders, fetchSuppliers } from '../../Apis/SupplierApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner, faChevronDown, faChevronUp, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, startOfMonth, differenceInDays, differenceInHours } from 'date-fns';
import Header from '../../components/Supplier/Header';
import Nav from '../../components/Supplier/Nav';
import Footer from '../../components/Supplier/Footer';

// Error Boundary Component
// මෙය දෝෂයක් ඇතිවූ විට පෙන්වන්නෙයි. 
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    // දෝෂයක් ඇතිවූ විට hasError true කරයි
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // දෝෂ පණිවිඩයක් පෙන්වයි
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-destructive-red text-center font-medium">
            Something went wrong while generating reports. Please try again later.
          </h2>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Report() {
  // State වලින් orders, suppliers, loading, error, expandedReports තබාගනී
  const [orders, setOrders] = React.useState([]);
  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [expandedReports, setExpandedReports] = React.useState({});

  React.useEffect(() => {
    // පළමුව loadData() function එක ක්‍රියාත්මක කරයි
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // orders සහ suppliers එකවර fetch කරයි
      const [ordersRes, suppliersRes] = await Promise.all([fetchOrders(), fetchSuppliers()]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setError(null);
    } catch (err) {
      // දෝෂයක් නම් error message එකක් set කරයි
      console.error('Error fetching data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Report එක expand/close කරන්න
  const toggleReport = (reportKey) => {
    setExpandedReports(prev => ({ ...prev, [reportKey]: !prev[reportKey] }));
  };

  // PDF එක attractive ලෙස නිර්මාණය කරන function එක
  const generatePDF = (title, columns, data, customStyles = {}) => {
    const doc = new jsPDF();

    // වර්ණ සකසයි
    const primaryGreen = [34, 107, 42]; // #266b2a
    const lightGreen = [76, 175, 80]; // #4CAF50
    const darkGray = [66, 66, 66]; // #424242
    const lightGray = [245, 245, 245]; // #F5F5F5

    // Header එකට පාටක් දමයි
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 30, 'F');

    // Logo එකක් ලෙස SFL කියලා දමයි
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 15, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('SFL', 20, 18);

    // Title එක set කරයි
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, 45, 18);

    // Subtitle එකට දිනය දමයි
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on ${currentDate}`, 45, 25);

    // Decorative line එකක් දමයි
    doc.setDrawColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    doc.setLineWidth(2);
    doc.line(14, 35, 196, 35);

    // Table එක attractive ලෙස set කරයි
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: primaryGreen,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 8, right: 6, bottom: 8, left: 6 }
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
        textColor: darkGray
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right' }
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        ...customStyles
      },
      margin: { top: 45, right: 14, bottom: 20, left: 14 },
      didDrawPage: (data) => {
        // Footer එකක් දමයි
        const pageCount = data.doc.internal.getNumberOfPages();
        const pageNumber = data.doc.internal.getCurrentPageInfo().pageNumber;

        // Footer background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(0, 280, 210, 17, 'F');

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Fruit Supply Chain Management System', 14, 290);
        doc.text(`Page ${pageNumber} of ${pageCount}`, 196 - doc.getTextWidth(`Page ${pageNumber} of ${pageCount}`), 290);

        // Footer line එකක් දමයි
        doc.setDrawColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        doc.setLineWidth(1);
        doc.line(14, 285, 196, 285);
      }
    });

    // Data තියෙනවා නම් summary box එකක් දමයි
    if (data.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 45;

      // Summary box background
      doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
      doc.roundedRect(14, finalY + 15, 182, 25, 3, 3, 'F');

      // Summary text
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Records: ${data.length}`, 20, finalY + 28);
      doc.text(`Report Type: ${title}`, 20, finalY + 35);

      // Icon එකක් දමයි
      doc.setFillColor(255, 255, 255);
      doc.circle(185, finalY + 27, 6, 'F');
      doc.setTextColor(lightGreen[0], lightGreen[1], lightGreen[2]);
      doc.setFontSize(12);
      doc.text('✓', 182, finalY + 30);
    }

    // PDF එක save කරයි
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  // Report 1: මාසික/කාර්තුවේ Order Summary එක
  const getMonthlyOrderSummary = () => {
    // orders වලින් මාස අනුව group කරයි
    const ordersByMonth = orders.reduce((acc, o) => {
      if (!o.deliveryDate) return acc;
      try {
        const month = format(startOfMonth(parseISO(o.deliveryDate)), 'MMM yyyy');
        acc[month] = acc[month] || { count: 0, cost: 0, pending: 0, approved: 0, denied: 0 };
        acc[month].count += 1;
        acc[month].cost += o.totalPrice || 0;
        acc[month][o.status] = (acc[month][o.status] || 0) + 1;
        return acc;
      } catch {
        return acc;
      }
    }, {});
    // summary එකක් return කරයි
    return Object.entries(ordersByMonth).map(([month, stats]) => ({
      month,
      totalOrders: stats.count,
      cost: stats.cost.toFixed(2),
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      denied: stats.denied || 0,
      avgOrderCost: stats.count ? (stats.cost / stats.count).toFixed(2) : 0,
    }));
  };

  // PDF එක download කරන්න
  const downloadMonthlyOrderSummaryPDF = () => {
    const data = getMonthlyOrderSummary().map(row => [
      row.month,
      row.totalOrders,
      `Rs. ${row.cost}`,
      row.pending,
      row.approved,
      row.denied,
      `Rs. ${row.avgOrderCost}`,
    ]);
    generatePDF('Monthly Order Summary',
      ['Month', 'Total Orders', 'Total Cost', 'Pending', 'Approved', 'Denied', 'Avg Order Cost'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
        }
      }
    );
  };

  // Report 2: පළතුරු/සැපයුම්කරු අනුව වියදම
  const getCostByFruitSupplier = (type = 'fruit') => {
    // orders වලින් පළතුරු හෝ සැපයුම්කරු අනුව group කරයි
    const key = type === 'fruit' ? 'fruit' : 'supplier.name';
    const costMap = orders.reduce((acc, o) => {
      if (!o.fruit || (type === 'supplier' && !o.supplier?.name)) return acc;
      const groupKey = type === 'fruit' ? o.fruit : o.supplier.name;
      acc[groupKey] = acc[groupKey] || { quantity: 0, cost: 0 };
      acc[groupKey].quantity += o.quantity || 0;
      acc[groupKey].cost += o.totalPrice || 0;
      return acc;
    }, {});
    // summary එකක් return කරයි
    return Object.entries(costMap).map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      cost: stats.cost.toFixed(2),
      avgPrice: stats.quantity ? (stats.cost / stats.quantity).toFixed(2) : 0,
    }));
  };

  // PDF එක download කරන්න
  const downloadCostByFruitPDF = () => {
    const data = getCostByFruitSupplier('fruit').map(row => [
      row.name,
      row.quantity,
      `Rs. ${row.cost}`,
      `Rs. ${row.avgPrice}`,
    ]);
    generatePDF('Cost Analysis by Fruit Type',
      ['Fruit Type', 'Total Quantity (kg)', 'Total Cost', 'Avg Price per kg'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 50, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [34, 107, 42] },
          3: { cellWidth: 40, halign: 'right', textColor: [76, 175, 80] }
        }
      }
    );
  };

  const downloadCostBySupplierPDF = () => {
    const data = getCostByFruitSupplier('supplier').map(row => [
      row.name,
      row.quantity,
      `Rs. ${row.cost}`,
      `Rs. ${row.avgPrice}`,
    ]);
    generatePDF('Cost Analysis by Supplier',
      ['Supplier Name', 'Total Quantity (kg)', 'Total Cost', 'Avg Price per kg'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 50, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [34, 107, 42] },
          3: { cellWidth: 40, halign: 'right', textColor: [76, 175, 80] }
        }
      }
    );
  };

  // Report 3: Supplier Reliability and Approval Rate
  const getSupplierReliability = () => {
    return suppliers.map(s => {
      const supplierOrders = orders.filter(o => o.supplier?._id === s._id || o.supplier === s._id);
      const total = supplierOrders.length;
      const approved = supplierOrders.filter(o => o.status === 'approved').length;
      const denied = supplierOrders.filter(o => o.status === 'denied').length;
      const validOrders = supplierOrders.filter(o => o.createdAt && (o.updatedAt || o.createdAt));
      const avgResponseTime = validOrders.length
        ? (validOrders.reduce((sum, o) => {
          try {
            const start = parseISO(o.createdAt);
            const end = parseISO(o.updatedAt || o.createdAt);
            return sum + differenceInHours(end, start);
          } catch {
            return sum;
          }
        }, 0) / validOrders.length).toFixed(1)
        : 0;
      return {
        supplier: s.name,
        totalOrders: total,
        approvalRate: total ? ((approved / total) * 100).toFixed(1) : 0,
        deniedOrders: denied,
        avgResponseTime,
        cost: supplierOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2),
      };
    }).filter(s => s.totalOrders > 0);
  };

  const downloadSupplierReliabilityPDF = () => {
    const data = getSupplierReliability().map(row => [
      row.supplier,
      row.totalOrders,
      `${row.approvalRate}%`,
      row.deniedOrders,
      `${row.avgResponseTime} hrs`,
      `Rs. ${row.cost}`,
    ]);
    generatePDF('Supplier Reliability & Performance Report',
      ['Supplier', 'Total Orders', 'Approval Rate', 'Denied Orders', 'Avg Response Time', 'Total Cost'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [76, 175, 80] },
          3: { cellWidth: 25, halign: 'center', textColor: [244, 67, 54] },
          4: { cellWidth: 30, halign: 'center' },
          5: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [34, 107, 42] }
        }
      }
    );
  };

  // Report 4: Supplier Delivery Performance
  const getSupplierDeliveryPerformance = () => {
    return suppliers.map(s => {
      const supplierOrders = orders.filter(o => (o.supplier?._id === s._id || o.supplier === s._id) && o.trackingStatus);
      const total = supplierOrders.length;
      const onTime = supplierOrders.filter(o => {
        try {
          return o.trackingStatus === 'Delivered' && parseISO(o.updatedAt) <= parseISO(o.deliveryDate);
        } catch {
          return false;
        }
      }).length;
      const delayed = supplierOrders.filter(o => {
        try {
          return o.trackingStatus === 'Delivered' && parseISO(o.updatedAt) > parseISO(o.deliveryDate);
        } catch {
          return false;
        }
      }).length;
      return {
        supplier: s.name,
        totalOrders: total,
        onTimeRate: total ? ((onTime / total) * 100).toFixed(1) : 0,
        delayedOrders: delayed,
        cost: supplierOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2),
      };
    }).filter(s => s.totalOrders > 0);
  };

  const downloadSupplierDeliveryPDF = () => {
    const data = getSupplierDeliveryPerformance().map(row => [
      row.supplier,
      row.totalOrders,
      `${row.onTimeRate}%`,
      row.delayedOrders,
      `Rs. ${row.cost}`,
    ]);
    generatePDF('Supplier Delivery Performance Analysis',
      ['Supplier', 'Total Orders', 'On-Time Rate', 'Delayed Orders', 'Total Cost'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 40, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [76, 175, 80] },
          3: { cellWidth: 30, halign: 'center', textColor: [255, 152, 0] },
          4: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [34, 107, 42] }
        }
      }
    );
  };

  // Report 5: Fruit Demand Forecast
  const getFruitDemandForecast = () => {
    const demandMap = orders.reduce((acc, o) => {
      if (!o.deliveryDate || !o.fruit) return acc;
      try {
        const month = format(startOfMonth(parseISO(o.deliveryDate)), 'MMM yyyy');
        acc[o.fruit] = acc[o.fruit] || {};
        acc[o.fruit][month] = (acc[o.fruit][month] || 0) + (o.quantity || 0);
        return acc;
      } catch {
        return acc;
      }
    }, {});
    return Object.entries(demandMap).map(([fruit, months]) => {
      const monthlyData = Object.entries(months).sort((a, b) => new Date(a[0]) - new Date(b[0]));
      const total = monthlyData.reduce((sum, [, qty]) => sum + qty, 0);
      const avgMonthly = total / monthlyData.length;
      const lastMonth = monthlyData[monthlyData.length - 1]?.[1] || 0;
      const forecast = (lastMonth * 1.1).toFixed(0); // Simple 10% growth
      return { fruit, total, avgMonthly: avgMonthly.toFixed(0), forecast };
    });
  };

  const downloadFruitDemandPDF = () => {
    const data = getFruitDemandForecast().map(row => [
      row.fruit,
      row.total,
      row.avgMonthly,
      row.forecast,
    ]);
    generatePDF('Fruit Demand Forecast & Analysis',
      ['Fruit Type', 'Total Historical Demand', 'Avg Monthly Demand', 'Next Month Forecast'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 45, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 45, halign: 'center' },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 45, halign: 'center', fontStyle: 'bold', textColor: [33, 150, 243] }
        }
      }
    );
  };

  // Report 6: Pending Orders Aging
  const getPendingOrdersAging = () => {
    return orders
      .filter(o => o.status === 'pending' && o.createdAt)
      .map(o => {
        try {
          const age = differenceInDays(new Date(), parseISO(o.createdAt));
          return {
            orderId: o.orderId,
            fruit: o.fruit,
            supplier: o.supplier?.name || 'N/A',
            age,
            alert: age > 7 ? 'High' : 'Normal',
          };
        } catch {
          return null;
        }
      })
      .filter(row => row !== null);
  };

  const downloadPendingOrdersAgingPDF = () => {
    const data = getPendingOrdersAging().map(row => [
      row.orderId,
      row.fruit,
      row.supplier,
      `${row.age} days`,
      row.alert,
    ]);
    generatePDF('Pending Orders Aging Analysis',
      ['Order ID', 'Fruit Type', 'Supplier', 'Age', 'Priority Alert'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 35, halign: 'left' },
          2: { cellWidth: 40, halign: 'left' },
          3: { cellWidth: 25, halign: 'center' },
          4: {
            cellWidth: 35, halign: 'center', fontStyle: 'bold',
            textColor: [244, 67, 54]
          } // Red for high priority
        }
      }
    );
  };

  // Report 7: Order Tracking Status
  const getOrderTrackingStatus = () => {
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.trackingStatus || 'Not Started'] = (acc[o.trackingStatus || 'Not Started'] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / orders.length) * 100).toFixed(1),
    }));
  };

  const downloadOrderTrackingPDF = () => {
    const data = getOrderTrackingStatus().map(row => [
      row.status,
      row.count,
      `${row.percentage}%`,
    ]);
    generatePDF('Order Tracking Status Overview',
      ['Tracking Status', 'Number of Orders', 'Percentage of Total'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 60, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 45, halign: 'center', fontSize: 11 },
          2: { cellWidth: 45, halign: 'center', fontStyle: 'bold', textColor: [76, 175, 80] }
        }
      }
    );
  };

  // Report 8: Notification and Alert Summary
  const getNotificationSummary = () => {
    const notifications = orders
      .map(o => {
        const notificationsList = [];
        if (!o.deliveryDate || !o.createdAt) return notificationsList;
        try {
          const hoursUntilDelivery = differenceInHours(parseISO(o.deliveryDate), new Date());
          if (o.status === 'approved') {
            notificationsList.push({ type: 'success', message: `Order ${o.orderId} approved by ${o.supplier?.name || 'N/A'}` });
          }
          if (o.status === 'denied') {
            notificationsList.push({ type: 'error', message: `Order ${o.orderId} denied by ${o.supplier?.name || 'N/A'}` });
          }
          if (hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && o.status === 'approved') {
            notificationsList.push({ type: 'warning', message: `Order ${o.orderId} due in ${Math.round(hoursUntilDelivery)}h` });
          }
          if (['In Transit', 'Out for Delivery', 'Delivered'].includes(o.trackingStatus)) {
            notificationsList.push({ type: 'info', message: `Order ${o.orderId}: ${o.trackingStatus}` });
          }
          return notificationsList;
        } catch {
          return notificationsList;
        }
      })
      .flat();
    const summary = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(summary).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: ((count / notifications.length) * 100).toFixed(1),
    }));
  };

  const downloadNotificationSummaryPDF = () => {
    const data = getNotificationSummary().map(row => [
      row.type,
      row.count,
      `${row.percentage}%`,
    ]);
    generatePDF('Notification & Alert Summary Report',
      ['Notification Type', 'Total Count', 'Percentage Distribution'],
      data,
      {
        columnStyles: {
          0: { cellWidth: 60, halign: 'left', fontStyle: 'bold' },
          1: { cellWidth: 45, halign: 'center', fontSize: 11 },
          2: { cellWidth: 45, halign: 'center', fontStyle: 'bold', textColor: [156, 39, 176] }
        }
      }
    );
  };

  // UI එක loading නම් spinner එකක් පෙන්වයි
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FontAwesomeIcon icon={faSpinner} spin className="text-primary-green text-4xl" />
      </div>
    );
  }

  // Error එකක් නම් error message එකක් පෙන්වයි
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-destructive-red text-xl">{error}</p>
      </div>
    );
  }

  // Reports UI එක render කරයි
  return (
    <>
      <Header />
      <Nav />
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center mb-8">
              <FontAwesomeIcon icon={faChartPie} className="text-primary-green text-2xl mr-3" />
              <h1 className="text-3xl font-bold text-primary-green">Reports</h1>
            </div>

            <div className="space-y-6">
              {/* මෙහි reports array එකක් map කරලා report card එකක් හැම එකකටම පෙන්වයි */}
              {[
                {
                  key: 'monthlyOrderSummary',
                  title: 'Monthly Order Summary',
                  data: getMonthlyOrderSummary(),
                  columns: ['Month', 'Total Orders', 'Cost', 'Pending', 'Approved', 'Denied', 'Avg Order Cost'],
                  download: downloadMonthlyOrderSummaryPDF,
                },
                {
                  key: 'costByFruit',
                  title: 'Cost by Fruit',
                  data: getCostByFruitSupplier('fruit'),
                  columns: ['Fruit', 'Total Quantity', 'Cost', 'Avg Price/Unit'],
                  download: downloadCostByFruitPDF,
                },
                {
                  key: 'costBySupplier',
                  title: 'Cost by Supplier',
                  data: getCostByFruitSupplier('supplier'),
                  columns: ['Supplier', 'Total Quantity', 'Cost', 'Avg Price/Unit'],
                  download: downloadCostBySupplierPDF,
                },
                {
                  key: 'supplierReliability',
                  title: 'Supplier Reliability and Approval Rate',
                  data: getSupplierReliability(),
                  columns: ['Supplier', 'Total Orders', 'Approval Rate', 'Denied Orders', 'Avg Response Time', 'Cost'],
                  download: downloadSupplierReliabilityPDF,
                },
                {
                  key: 'supplierDelivery',
                  title: 'Supplier Delivery Performance',
                  data: getSupplierDeliveryPerformance(),
                  columns: ['Supplier', 'Total Orders', 'On-Time Rate', 'Delayed Orders', 'Cost'],
                  download: downloadSupplierDeliveryPDF,
                },
                {
                  key: 'fruitDemand',
                  title: 'Fruit Demand Forecast',
                  data: getFruitDemandForecast(),
                  columns: ['Fruit', 'Total Quantity', 'Avg Monthly', 'Next Month Forecast'],
                  download: downloadFruitDemandPDF,
                },
                {
                  key: 'pendingOrdersAging',
                  title: 'Pending Orders Aging',
                  data: getPendingOrdersAging(),
                  columns: ['Order ID', 'Fruit', 'Supplier', 'Age', 'Alert'],
                  download: downloadPendingOrdersAgingPDF,
                },
                {
                  key: 'orderTracking',
                  title: 'Order Tracking Status',
                  data: getOrderTrackingStatus(),
                  columns: ['Tracking Status', 'Count', 'Percentage'],
                  download: downloadOrderTrackingPDF,
                },
                {
                  key: 'notificationSummary',
                  title: 'Notification and Alert Summary',
                  data: getNotificationSummary(),
                  columns: ['Type', 'Count', 'Percentage'],
                  download: downloadNotificationSummaryPDF,
                },
              ].map(report => (
                <div key={report.key} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary-green">{report.title}</h2>
                    <div className="flex gap-4">
                      {/* expand/collapse button එක */}
                      <button
                        onClick={() => toggleReport(report.key)}
                        className="text-primary-green hover:text-white px-3 py-2 rounded-sm"
                        data-tooltip-id={`toggle-${report.key}`}
                        data-tooltip-content={expandedReports[report.key] ? 'Collapse' : 'Expand'}
                      >
                        <FontAwesomeIcon icon={expandedReports[report.key] ? faChevronUp : faChevronDown} />
                        <Tooltip id={`toggle-${report.key}`} />
                      </button>
                      {/* PDF download button එක */}
                      <button
                        onClick={report.download}
                        className="bg-primary-green text-white px-4 py-2 rounded hover:bg-[#266b2a] flex items-center transition-colors duration-200"
                        data-tooltip-id={`pdf-${report.key}`}
                        data-tooltip-content="Download Professional PDF"
                      >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                        PDF
                      </button>
                      <Tooltip id={`pdf-${report.key}`} />
                    </div>
                  </div>
                  {/* report එක expand කරාම table එක පෙන්වයි */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedReports[report.key] ? 'max-h-[1000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {report.columns.map((col, idx) => (
                              <th key={idx} className="p-3 text-gray-600 font-semibold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {report.data.length > 0 ? (
                            report.data.map((row, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="p-3">{value}</td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={report.columns.length} className="p-6 text-center text-gray-500">
                                {/* දත්ත නැත්නම් මෙය පෙන්වයි */}
                                No data available for this report
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
      <Footer />
    </>
  );
}