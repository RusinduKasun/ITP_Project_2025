import React, { useState } from "react";
import "./Products.css";
import { FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import AIChatbot from "./AIChatbot.jsx";
import Nav from "../Home/Nav/Nav.jsx";

// 🌱 Product data with MAIN categories
const productsData = [
  // Jackfruit
  { id: 1, name: "Jackfruit Noodles 400g", price: 800, image: "/images/noodle.jpg", category: "Jackfruit" },
  { id: 2, name: "Jackfruit Chips 100g", price: 450, image: "/images/chips.png", category: "Jackfruit" },
  { id: 3, name: "Jackfruit Cordial 500ml", price: 950, image: "/images/juice.png", category: "Jackfruit" },
  { id: 4, name: "Raw Jackfruit Pack 1kg", price: 700, image: "/images/jackraw.png", category: "Jackfruit" },
  { id: 5, name: "Jackfruit Curry 250g", price: 500, image: "/images/curry.jpg", category: "Jackfruit" },
  { id: 6, name: "Natural Young Jackfruit in Brine 400g", price: 1200, image: "/images/brine.png", category: "Jackfruit" },




  // Wood Apple
  { id: 5, name: "Wood Apple Jam 250g", price: 600, image: "/images/woople-jam.png", category: "Wood Apple" },
  { id: 6, name: "Wood Apple Juice 350ml", price: 550, image: "/images/woodapplejuice.jpg", category: "Wood Apple" },
  { id: 7, name: "Wood Apple Cordial 500ml", price: 900, image: "/images/Wood-Apple-Cordial.jpg", category: "Wood Apple" },

  // Durian
  { id: 8, name: "Durian Syrup 250ml", price: 1200, image: "/images/duriansyrup.jpg", category: "Durian" },
  { id: 9, name: "Durian Juice 350ml", price: 1100, image: "/images/durianjuice.jpg", category: "Durian" },
  { id: 10, name: "Fresh Durian Pack 1kg", price: 2500, image: "/images/freshdurian.jpeg", category: "Durian" },

  // Banana
  { id: 11, name: "Banana Chips 100g", price: 400, image: "/images/bananachips.webp", category: "Banana" },
  { id: 12, name: "Banana Juice 350ml", price: 450, image: "/images/bananajuice.webp", category: "Banana" },
  { id: 13, name: "Raw Banana Pack 1kg", price: 300, image: "/images/rawbanana.webp", category: "Banana" },

  // Others
  { id: 14, name: "Jackfruit and durian mixIce Cream 1L", price: 1500, image: "/images/jackfruiticecream.jpg", category: "Others" },
  { id: 15, name: "1 King coconut ", price: 300, image: "/images/kingcoconut.webp", category: "Others" },
];

function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [quantities, setQuantities] = useState({});

  // ✅ Define only main categories
  const categories = ["Jackfruit", "Wood Apple", "Durian", "Banana", "Others"];

  // ✅ Handle quantity
  const handleQuantityChange = (id, value) => {
    if (value < 1) value = 1;
    setQuantities({ ...quantities, [id]: value });
  };

  const incrementQty = (id) => {
    const current = quantities[id] || 1;
    setQuantities({ ...quantities, [id]: current + 1 });
  };

  const decrementQty = (id) => {
    const current = quantities[id] || 1;
    const next = Math.max(1, current - 1);
    setQuantities({ ...quantities, [id]: next });
  };

  // ✅ Add to cart (POST)
  const addToCart = async (product) => {
    const quantity = quantities[product.id] ? parseInt(quantities[product.id]) : 1;

    const cartItem = {
      name: product.name,
      gmail: "cart@dummy.com",
      age: product.price,
      address: "item",
      quantity: quantity,
    };

    try {
      const response = await fetch("http://localhost:5000/api/productOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      });

      if (response.ok) {
        Swal.fire({
          title: "Added to Cart! 🛒",
          text: `${product.name} (${quantity}x) added successfully.`,
          icon: "success",
          confirmButtonColor: "#28a745",
        });
        // Update cart count in localStorage
        let currentCount = localStorage.getItem('cartCount');
        currentCount = currentCount ? parseInt(currentCount) : 0;
        localStorage.setItem('cartCount', currentCount + 1);
        // Dispatch storage event for other tabs/components
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      Swal.fire({
        title: "Server Error ⚠️",
        text: "Please check if backend is running.",
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
      });
    }
  };

  // ✅ Filter products
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Nav />
      <div className="products-page">
        {/* 🌍 Mission Section */}
        <div className="products-header">
          <h1>🍃 Taste of Ceylon</h1>
          <p>
            Founded with a mission to reduce fruit wastage by transforming raw, locally sourced fruits
            into high-quality, value-added products. We create jackfruit, wood apple, durian and banana products,
            empowering local farmers and bringing Sri Lankan flavors to the world.
          </p>
        </div>

        {/* 🔎 Filters */}
        <div className="filter-box">
          <div className="filter-row">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <button
                className={`btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </button>
              <button
                className={`btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                style={{ marginLeft: 8 }}
              >
                List View
              </button>
            </div>
          </div>

          {/* ✅ Main Categories */}
          <div className="category-filters">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn ${selectedCategory === null ? "active" : ""}`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${selectedCategory === category ? "active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Product List */}
        <div className="results-info">
          Showing <span className="badge">{filteredProducts.length}</span> items
        </div>

        <div className={viewMode === "grid" ? "products-grid" : "products-list"}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-card-content">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price} LKR</p>

                  <div className="qty-group">
                    <button
                      className="qty-btn"
                      onClick={() => decrementQty(product.id)}
                      type="button"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product.id, parseInt(e.target.value))
                      }
                      className="quantity-input"
                    />
                    <button
                      className="qty-btn"
                      onClick={() => incrementQty(product.id)}
                      type="button"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button onClick={() => addToCart(product)} className="add-btn">
                    <FaShoppingCart style={{ marginRight: 8 }} /> Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
        <AIChatbot />
      </div>
    </>
  );
}

export default Products;
