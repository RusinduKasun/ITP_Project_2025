import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import Nav from "../Home/Nav/Nav.jsx";
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address || {};

  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    saveCard: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const validate = () => {
    let newErrors = {};
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!/^[A-Za-z ]{3,}$/.test(formData.name)) {
      newErrors.name = 'Enter a valid name (letters only)';
    }

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumberDigits)) {
      newErrors.cardNumber = 'Card number must be exactly 16 digits';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Enter expiry as MM/YY';
    } else {
      const [mm, yy] = formData.expiry.split('/').map(Number);
      if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        newErrors.expiry = 'Card is expired';
      }
    }

    if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessPopup(true);
        setTimeout(() => {
          setSuccessPopup(false);
          navigate('/ordersummary', { state: { address } });
        }, 2000);
      }, 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let inputValue = value;

    if (name === 'cardNumber') {
      // Only numbers, add space every 4 digits
      inputValue = inputValue.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (inputValue.length > 19) inputValue = inputValue.slice(0, 19); // 16 digits + 3 spaces
    }
    if (name === 'cvv') {
      inputValue = inputValue.replace(/\D/g, '');
    }
    if (name === 'expiry') {
      // Only numbers and auto-insert '/'
      let exp = inputValue.replace(/[^\d]/g, '');
      if (exp.length > 2) exp = exp.slice(0,2) + '/' + exp.slice(2,4);
      inputValue = exp.slice(0,5);
    }
    if (name === 'name') {
      // Only letters and spaces
      inputValue = inputValue.replace(/[^A-Za-z\s]/g, '');
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : inputValue,
    });
  };

  return (
        <>
      <Nav />
    <div className="payment-container">
      <form className="payment-form" onSubmit={handlePay}>
        <h2>💳 Secure Payment</h2>

        <div className="order-details">
          <h3>📦 Delivery Address</h3>
          <p>{address.name}, {address.phone}</p>
          <p>{address.street}, {address.city}, {address.zip}, {address.country}</p>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Cardholder Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number (16 digits)"
          maxLength={19}
          value={formData.cardNumber}
          onChange={handleChange}
        />
        {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}

        <input
          type="text"
          name="expiry"
          placeholder="Expiry (MM/YY)"
          maxLength={5}
          value={formData.expiry}
          onChange={handleChange}
        />
        {errors.expiry && <span className="error">{errors.expiry}</span>}

        <input
          type="password"
          name="cvv"
          placeholder="CVV"
          maxLength={4}
          value={formData.cvv}
          onChange={handleChange}
        />
        {errors.cvv && <span className="error">{errors.cvv}</span>}

        <label className="save-card">
          <input
            type="checkbox"
            name="saveCard"
            checked={formData.saveCard}
            onChange={handleChange}
          />
          Save Card for Future Orders
        </label>

        <button type="submit" disabled={loading}>
          {loading ? <span className="loader"></span> : 'Pay Now'}
        </button>
      </form>

      {/* Success Popup */}
      {successPopup && (
        <div className="popup">
          <div className="popup-content">
            ✅ Payment Successful!
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Payment;
