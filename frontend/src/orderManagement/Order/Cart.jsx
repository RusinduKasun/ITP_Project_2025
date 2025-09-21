import React, { useEffect, useState } from "react";
import './Cart.css';
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('localCart') || '[]');
      setCartItems(local);
    } catch (e) {
      console.error('Error reading local cart', e);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      // Remove locally by matching a simple identifier (name) because localCart items may not have _id
      const updatedCart = cartItems.filter(item => item.name !== itemId && item._id !== itemId);
      // Persist
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      // Update cart count in localStorage
      localStorage.setItem('cartCount', updatedCart.length);
  // Notify other tabs and same-tab listeners
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.age || 0) * (item.quantity || 1),
      0
    );
  };

  if (loading) {
    return <div className="cart-page">Loading cart...</div>;
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>No items in cart.</p>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map((item, idx) => (
              <div key={item._id || `${item.name}-${idx}`} className="cart-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">
                    {item.age} LKR × {item.quantity}
                  </p>
                  <p><strong>Subtotal:</strong> {item.age * item.quantity} LKR</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id || item.name)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: {calculateTotal()} LKR</h3>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;


