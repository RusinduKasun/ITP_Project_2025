import React, { useState, useEffect } from "react";
import "./Products.css";
import { FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import AIChatbot from "./AIChatbot.jsx";
import { useAuth } from "../../Context/AuthContext";
import { useLocation } from 'react-router-dom';

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
  { id: 7, name: "Wood Apple Jam 250g", price: 600, image: "/images/woople-jam.png", category: "Wood Apple" },
  { id: 8, name: "Wood Apple Juice 350ml", price: 550, image: "/images/woodapplejuice.jpg", category: "Wood Apple" },
  { id: 9, name: "Wood Apple Cordial 500ml", price: 900, image: "/images/Wood-Apple-Cordial.jpg", category: "Wood Apple" },

  // Durian
  { id: 10, name: "Durian Syrup 250ml", price: 1200, image: "/images/duriansyrup.jpg", category: "Durian" },
  { id: 11, name: "Durian Juice 350ml", price: 1100, image: "/images/durianjuice.jpg", category: "Durian" },
  { id: 12, name: "Fresh Durian Pack 1kg", price: 2500, image: "/images/freshdurian.jpeg", category: "Durian" },

  // Banana
  { id: 13, name: "Banana Chips 100g", price: 400, image: "/images/bananachips.webp", category: "Banana" },
  { id: 14, name: "Banana Juice 350ml", price: 450, image: "/images/bananajuice.webp", category: "Banana" },
  { id: 15, name: "Raw Banana Pack 1kg", price: 300, image: "/images/rawbanana.webp", category: "Banana" },

  // Others
  { id: 16, name: "Jackfruit and durian mixIce Cream 1L", price: 1500, image: "/images/jackfruiticecream.jpg", category: "Others" },
  { id: 17, name: "1 King coconut ", price: 300, image: "/images/kingcoconut.webp", category: "Others" },
];

function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [quantities, setQuantities] = useState({});
  const categoryRefs = React.useRef({});

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

  const { user } = useAuth();
  const location = useLocation();

  // ✅ Add to cart (POST) — requires authentication
  const addToCart = async (product) => {
    // If user is not logged in, prompt to login/register
    if (!user) {
      const result = await Swal.fire({
        title: 'You need to be logged in',
        text: 'Please login or register to add items to your cart and complete purchases.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login / Register',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
      });

      if (result.isConfirmed) {
        // navigate to login while preserving current location would be ideal;
        // we don't import navigate here to keep this function simple — just set a flag in localStorage
        // so the app can redirect after login. A better approach is to pass returnTo in state via navigate.
        localStorage.setItem('postLoginReturn', JSON.stringify({ path: '/cart' }));
        window.location.href = '/login';
      }

      return;
    }
    const quantity = quantities[product.id] ? parseInt(quantities[product.id]) : 1;

    const cartItem = {
      name: product.name,
      gmail: "cart@dummy.com",
      age: product.price,
      address: "item",
      quantity: quantity,
    };

    try {
        // Save to a local cart in localStorage (no backend/auth needed)
        const existing = JSON.parse(localStorage.getItem('localCart') || '[]');
        const existingIndex = existing.findIndex(i => i.name === cartItem.name);
        if (existingIndex > -1) {
          existing[existingIndex].quantity = (existing[existingIndex].quantity || 1) + quantity;
        } else {
          existing.push(cartItem);
        }
        localStorage.setItem('localCart', JSON.stringify(existing));
        Swal.fire({
          title: "Added to Cart! 🛒",
          text: `${product.name} (${quantity}x) added successfully.`,
          icon: "success",
          confirmButtonColor: "#28a745",
        });
  // Update cart count in localStorage
  localStorage.setItem('cartCount', existing.length);
        // Notify same-tab listeners
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cart-updated'));
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

  // Read initial category from query param or hash (e.g. /products?category=Jackfruit#jackfruit)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('category');
      const hash = location.hash ? location.hash.replace(/^#/, '') : null;

      let desired = null;
      if (q) {
        const decoded = decodeURIComponent(q);
        // prefer exact match
        const exact = categories.find((c) => c === decoded);
        if (exact) desired = exact;
        else {
          // maybe the query is a slug
          const bySlug = categories.find((c) => c.toLowerCase().replace(/\s+/g, '-') === decoded.toLowerCase());
          if (bySlug) desired = bySlug;
        }
      }

      if (!desired && hash) {
        const byHash = categories.find((c) => c.toLowerCase().replace(/\s+/g, '-') === hash.toLowerCase());
        if (byHash) desired = byHash;
      }

      setSelectedCategory(desired || null);
    } catch (err) {
      // ignore URL parse errors and keep current selection
      // console.debug('products: failed to parse location for category', err);
    }
  }, [location.search, location.hash]);

  // Auto-scroll active category chip into view for better UX
  useEffect(() => {
    try {
      const key = selectedCategory ? selectedCategory.toLowerCase().replace(/\s+/g, '-') : 'All';
      const el = categoryRefs.current[key];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    } catch (err) {
      // ignore
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold">🍃 Taste of Ceylon</h1>
            <p className="mt-2 text-gray-600 max-w-xl">Locally sourced jackfruit, wood apple, durian and banana products — handcrafted and ready to enjoy. Filter by category or search to find what you need.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`ml-2 px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 flex items-center gap-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <button onClick={() => setSearchQuery('')} className="text-sm text-gray-500">Clear</button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-2">
              <button
                ref={(el) => (categoryRefs.current['All'] = el)}
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === null ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                aria-pressed={selectedCategory === null}
              >
                All Items
              </button>
              {categories.map((category) => {
                const slug = category.toLowerCase().replace(/\s+/g, '-');
                return (
                  <button
                    key={category}
                    ref={(el) => (categoryRefs.current[slug] = el)}
                    onClick={() => setSelectedCategory(category)}
                    className={`ml-2 px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    aria-pressed={selectedCategory === category}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span> items</div>

        <div className={`mt-4 grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md mb-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <div className="text-sm text-emerald-600 mt-1">{product.price} LKR</div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => decrementQty(product.id)} className="px-2 py-1 bg-gray-100 rounded">−</button>
                    <input value={quantities[product.id] || 1} onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value || '1'))} className="w-14 text-center border rounded" />
                    <button onClick={() => incrementQty(product.id)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                  </div>

                  <button onClick={() => addToCart(product)} className="bg-emerald-600 text-white px-3 py-2 rounded-md flex items-center">
                    <FaShoppingCart className="mr-2" /> Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-6 rounded-lg text-center shadow-sm">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="mt-2 text-sm text-gray-600">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
      </div>
      <AIChatbot />
    </div>
  );
}

export default Products;
