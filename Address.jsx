import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Address.css';

const Address = () => {
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    country: ''
  });

  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};

    if (!/^[A-Za-z ]{3,}$/.test(address.name)) {
      newErrors.name = 'Name must contain only letters';
    }
    if (!/^\d{10,15}$/.test(address.phone)) {
      newErrors.phone = 'Enter a valid phone number (10-15 digits)';
    }
    if (address.street.trim().length < 3) {
      newErrors.street = 'Enter a valid street address';
    }
    if (!/^[A-Za-z ]{2,}$/.test(address.city)) {
      newErrors.city = 'City must contain only letters';
    }
    if (!/^\d{4,6}$/.test(address.zip)) {
      newErrors.zip = 'ZIP must be 4-6 digits';
    }
    if (!/^[A-Za-z ]{2,}$/.test(address.country)) {
      newErrors.country = 'Country must contain only letters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowPopup(true);

      // Hide popup and redirect after 2 seconds
      setTimeout(() => {
        setShowPopup(false);
        navigate('/payment', { state: { address } });
      }, 2000);
    }
  };

  return (
    <div className="address-container">
      <form className="address-form" onSubmit={handleSubmit}>
        <h2>🏠 Shipping Details</h2>

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={address.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={address.phone}
          onChange={handleChange}
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <input
          name="street"
          type="text"
          placeholder="Street Address"
          value={address.street}
          onChange={handleChange}
        />
        {errors.street && <span className="error">{errors.street}</span>}

        <input
          name="city"
          type="text"
          placeholder="City"
          value={address.city}
          onChange={handleChange}
        />
        {errors.city && <span className="error">{errors.city}</span>}

        <input
          name="zip"
          type="text"
          placeholder="ZIP Code"
          value={address.zip}
          onChange={handleChange}
        />
        {errors.zip && <span className="error">{errors.zip}</span>}

        <input
          name="country"
          type="text"
          placeholder="Country"
          value={address.country}
          onChange={handleChange}
        />
        {errors.country && <span className="error">{errors.country}</span>}

        <button type="submit">Continue to Payment</button>
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>✔ Address Saved!</h3>
            <p>Redirecting to payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
