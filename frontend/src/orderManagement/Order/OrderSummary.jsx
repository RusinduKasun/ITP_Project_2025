import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateOrderPDF } from './OrderSummaryPDF';
import './OrderSummary.css';

const whatsappNumber = '0711701408';

const OrderSummary = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Read ordered products from localCart when backend is unavailable / protected
    try {
      const local = JSON.parse(localStorage.getItem('localCart') || '[]');
      setProducts(local);
    } catch (e) {
      setProducts([]);
    }

    // Try to read a saved address from localStorage (if checkout flow stored it there)
    try {
      const savedAddress = JSON.parse(localStorage.getItem('localAddress') || '{}');
      if (savedAddress && Object.keys(savedAddress).length > 0) setAddress(savedAddress);
    } catch (e) {
      // no-op
    }
  }, []);

  const handleDownloadPDF = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      generateOrderPDF({ products, address });
    }, 1800);
  };

  const handleTrackOrder = () => {
    navigate('/ordertracking');
  };

  const getTotal = () => {
    return products.reduce((acc, item) => acc + Number(item.age || 0) * (item.quantity || 1), 0);
  };

  return (
    <div className="summary-container">
      <div className="summary-card">
        <h2>🛒 Order Summary</h2>

        {Object.keys(address).length > 0 ? (
          <div className="summary-details">
            <p><strong>👤 Name:</strong> {address.name}</p>
            <p><strong>📞 Phone:</strong> {address.phone}</p>
            <p><strong>✉ Email:</strong> {address.email || 'N/A'}</p>
            <p><strong>🏠 Address:</strong> {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''},
              {address.city}, {address.postalCode}, {address.country}</p>
          </div>
        ) : (
          <p className="empty-msg">⚠ No delivery address found!</p>
        )}

        <div className="products-list">
          <h3>📦 Products Ordered</h3>
          {products.length > 0 ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p._id || `${p.name}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                    <td>{p.age}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="3"><strong>Total</strong></td>
                  <td><strong>{getTotal()} LKR</strong></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="empty-msg">🛍 No products found in your order.</p>
          )}
        </div>

        <button onClick={handleDownloadPDF}>📄 Download PDF Report</button>
        <button onClick={handleTrackOrder}>🚚 Track Your Order</button>

        <a
          className="whatsapp-floating"
          href={`https://wa.me/94${whatsappNumber.slice(1)}?text=Hello%20Customer%20Care`}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 Chat on WhatsApp
        </a>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>✔ Generating PDF...</h3>
            <p>Your order summary will download shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
