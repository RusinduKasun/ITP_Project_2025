import React, { useEffect, useState } from "react";
import "./Shipping.css";
import Nav from "../Home/Nav/Nav.jsx";
function Shipping() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });

  const loadAddresses = async () => {
    const res = await fetch("http://localhost:5000/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses || []);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const showPopupMessage = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "success" }), 2000);
  };

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/;
    const postalRegex = /^[0-9]{3,10}$/;
  const emailRegex = /^[^\s@]+@gmail\.com$/;

  if (!emailRegex.test(form.email)) return "Email must end with @gmail.com";
    if (!phoneRegex.test(form.phone)) return "Phone number must be 10 digits.";
    if (!postalRegex.test(form.postalCode)) return "Postal Code must be numeric.";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "postalCode") {
      // Only allow numbers
      const onlyNums = value.replace(/[^0-9]/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyNums }));
      return;
    }
    if (name === "country" || name === "city") {
      // Only allow letters and spaces
      const onlyLetters = value.replace(/[^A-Za-z\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyLetters }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return showPopupMessage(error, "error");

    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:5000/api/addresses/${editingId}`
        : "http://localhost:5000/api/addresses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await loadAddresses();
        setForm({
          name: "",
          email: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          postalCode: "",
          country: "Sri Lanka",
          notes: "",
        });
        setEditingId(null);
        showPopupMessage(editingId ? "Address Updated ✅" : "Address Saved ✅");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({
      name: addr.name || "",
      email: addr.email || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      notes: addr.notes || "",
    });
    setEditingId(addr._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:5000/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAddresses();
      showPopupMessage("Address Deleted ❌", "error");
    }
  };

  return (
    <>
      <Nav />
      <div className="shipping-page">
        <div className="shipping-header">
          <h1>🚚 Shipping Details</h1>
          <p>Fill in your delivery information carefully. You can manage multiple addresses.</p>
        </div>

        <form className="shipping-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0712345678"
                maxLength={10}
                required
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Address Line 1</label>
            <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input name="addressLine2" value={form.addressLine2} onChange={handleChange} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                required
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} />
          </div>

          <div className="button-group">
            <button className="save-btn" type="submit" disabled={loading}>
              {editingId ? "Update Address" : "Save Address"}
            </button>
            <button className="paynow-btn" type="button" onClick={() => (window.location.href = "/payment")}>
              Proceed to Payment
            </button>
          </div>
        </form>

        <div className="address-list">
          <h2>📍 Saved Addresses</h2>
          <div className="cards">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div key={addr._id} className="card">
                  <div className="card-body">
                    <h3>{addr.name}</h3>
                    <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                    <p>{addr.city}, {addr.postalCode}, {addr.country}</p>
                    <p>{addr.email}{addr.phone ? ` · ${addr.phone}` : ""}</p>
                    {addr.notes && <p className="muted">{addr.notes}</p>}
                  </div>
                  <div className="card-actions">
                    <button className="btn" onClick={() => handleEdit(addr)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(addr._id)}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No saved addresses yet.</p>
            )}
          </div>
        </div>

        {popup.show && (
          <div className={`popup ${popup.type}`}>
            <p>{popup.message}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Shipping;
