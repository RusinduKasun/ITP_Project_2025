import React, { useEffect, useState } from "react";
import './Cart.css';
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/Users")
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          const actualCartItems = data.users.filter(item =>
            item.gmail === "cart@dummy.com"
          );
          setCartItems(actualCartItems);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching cart:", err);
        setLoading(false);
      });
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      await fetch(`http://localhost:5000/Users/${itemId}`, { method: 'DELETE' });
      const updatedCart = cartItems.filter(item => item._id !== itemId);
      setCartItems(updatedCart);
      // Update cart count in localStorage
      localStorage.setItem('cartCount', updatedCart.length);
      window.dispatchEvent(new Event('storage'));
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
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">
                    {item.age} LKR × {item.quantity}
                  </p>
                  <p><strong>Subtotal:</strong> {item.age * item.quantity} LKR</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id)}
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


