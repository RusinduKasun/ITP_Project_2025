import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

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

    if (!/^\d{16}$/.test(formData.cardNumber)) {
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

    // Prevent letters in card number & CVV
    if (name === 'cardNumber') {
      inputValue = inputValue.replace(/\D/g, ''); // only numbers
    }
    if (name === 'cvv') {
      inputValue = inputValue.replace(/\D/g, ''); // only numbers
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : inputValue,
    });
  };

  return (
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
          maxLength={16}
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
  );
};

export default Payment;
