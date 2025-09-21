import React, { useEffect, useState } from "react";
import './Cart.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../Context/AuthContext.jsx';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    try {
      if (!user) {
        setCartItems([]);
      } else {
        const uid = user._id || user.id || user.email;
        const cartKey = `localCart_user_${uid}`;
        const local = JSON.parse(localStorage.getItem(cartKey) || '[]');
        setCartItems(local);
      }
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
      // Persist into per-user cart
      if (user) {
        const uid = user._id || user.id || user.email;
        const cartKey = `localCart_user_${uid}`;
        const countKey = `cartCount_user_${uid}`;
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        // Update cart count in localStorage (sum of quantities)
        const newCount = updatedCart.reduce((s, it) => s + (it.quantity || 0), 0);
        localStorage.setItem(countKey, String(newCount));
        // Notify other listeners
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        // if no user, just clear local state
        setCartItems([]);
      }
  // Notify other tabs and same-tab listeners
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
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
                    {item.price} LKR × {item.quantity}
                  </p>
                  <p><strong>Subtotal:</strong> {(item.price || 0) * (item.quantity || 1)} LKR</p>
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
            <button className="checkout-btn" onClick={async () => {
              if (!user) {
                const res = await window.Swal?.fire?.({
                  title: 'Login required',
                  text: 'Please login or register to proceed to checkout.',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'Login',
                  cancelButtonText: 'Register',
                });
                if (res?.isConfirmed) return navigate(`/login?returnUrl=/checkout`);
                if (res?.dismiss === window.Swal?.DismissReason?.cancel) return navigate(`/register?returnUrl=/checkout`);
                return;
              }
              navigate('/checkout');
            }}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;


