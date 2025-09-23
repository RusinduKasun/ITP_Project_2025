import React, { useEffect, useState } from "react";
import "./OrderTracking.css";

const statusSteps = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderTracking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState({});
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest address from backend
    fetch("http://localhost:5000/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          setAddress(data.addresses[0]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (address.city) {
      calculateDistanceFromColombo(address.city);
    }
  }, [address]);

  // Coordinates for all 25 districts in Sri Lanka
  const cityCoords = {
    Colombo: { lat: 6.9271, lon: 79.8612 },
    Gampaha: { lat: 7.0917, lon: 79.9947 },
    Kalutara: { lat: 6.5836, lon: 79.9607 },
    Kandy: { lat: 7.2906, lon: 80.6337 },
    Matale: { lat: 7.4675, lon: 80.6234 },
    NuwaraEliya: { lat: 6.9707, lon: 80.7826 },
    Galle: { lat: 6.0535, lon: 80.2210 },
    Matara: { lat: 5.9549, lon: 80.5540 },
    Hambantota: { lat: 6.1246, lon: 81.1185 },
    Jaffna: { lat: 9.6615, lon: 80.0255 },
    Kilinochchi: { lat: 9.3932, lon: 80.3982 },
    Mannar: { lat: 8.9775, lon: 79.9042 },
    Vavuniya: { lat: 8.7512, lon: 80.4982 },
    Mullaitivu: { lat: 9.2671, lon: 80.8145 },
    Batticaloa: { lat: 7.7102, lon: 81.6924 },
    Ampara: { lat: 7.2986, lon: 81.6827 },
    Trincomalee: { lat: 8.5874, lon: 81.2152 },
    Kurunegala: { lat: 7.4863, lon: 80.3647 },
    Puttalam: { lat: 8.0363, lon: 79.8287 },
    Anuradhapura: { lat: 8.3114, lon: 80.4037 },
    Polonnaruwa: { lat: 7.9403, lon: 81.0188 },
    Badulla: { lat: 6.9894, lon: 81.0550 },
    Monaragala: { lat: 6.8728, lon: 81.3509 },
    Ratnapura: { lat: 6.6828, lon: 80.3992 },
    Kegalle: { lat: 7.2513, lon: 80.3464 },
  };

  // Haversine formula for distance in km
  function haversine(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }

  const calculateDistanceFromColombo = (destinationCity) => {
    if (!destinationCity) {
      setDistance(null);
      return;
    }
    const normalized = destinationCity.replace(/\s+/g, '').toLowerCase();
    const colombo = cityCoords["Colombo"];
    // Find matching district (case-insensitive, ignore spaces)
    let dest = colombo;
    for (const key in cityCoords) {
      if (key.replace(/\s+/g, '').toLowerCase() === normalized) {
        dest = cityCoords[key];
        break;
      }
    }
    const km = haversine(colombo.lat, colombo.lon, dest.lat, dest.lon);
    setDistance(km);
  };

  const showPopup = (msg) => {
    alert(msg);
  };

  const handleStepChange = () => {
    if (currentStep < statusSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      showPopup(`✅ Status updated to: ${statusSteps[currentStep + 1]}`);
    } else {
      showPopup("🎉 Your order has been delivered!");
    }
  };

  if (loading) return <div className="tracking-loading">Loading Order Tracking...</div>;

  return (
    <div className="tracking-container">
      <div className="tracking-card">
        <h2>Order Tracking</h2>

        {/* Address Section */}
        <div className="address-section">
          <h3>Delivery Address</h3>
          <p><strong>{address.name}</strong> - {address.phone}</p>
          <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
          <p>{address.city}, {address.postalCode}, {address.country}</p>
        </div>

        {/* Distance Info */}
        {distance && <p className="distance-info">📍 Distance from Colombo: {distance} km</p>}

        {/* Tracking Steps */}
        <div className="tracking-steps">
          {statusSteps.map((step, idx) => (
            <div key={step} className={`step ${idx <= currentStep ? "active" : ""}`}>
              <span className="step-index">{idx + 1}</span>
              <span className="step-label">{step}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <iframe
          title="Delivery Route"
          className="map-frame"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=79.8612,6.9271,80.7718,7.8731&layer=mapnik&marker=${address.city ? encodeURIComponent(address.city) : 'Colombo'}`}
          style={{ border: 0 }}
          allowFullScreen
        ></iframe>

        {/* Status Buttons */}
        <button className="update-btn" onClick={handleStepChange}>
          {currentStep < statusSteps.length - 1 ? "Update Status" : "Mark as Delivered"}
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
