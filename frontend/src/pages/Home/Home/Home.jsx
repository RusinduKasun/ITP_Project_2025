import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../Nav/Nav.jsx';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const categories = [
  { name: 'Jackfruit', image: '/images/jackcat.jpeg' },
  { name: 'Wood Apple', image: '/images/woodapplecat.webp' },
  { name: 'Durian', image: '/images/duriancat.jpeg' },
  { name: 'Banana', image: '/images/bananacat.webp' },
  { name: 'Others', image: '/images/othercat.webp' }
];

const products = [
  { name: 'Jackfruit Noodles', price: '550 LKR', image: '/images/noodle.jpg', category: 'Jackfruit' },
  { name: 'Durian Syrup 250ml', price: '1,250 LKR', image: '/images/duriansyrup.jpg', category: 'Durian' },
  { name: 'Fresh Durian 1kg', price: '3,200 LKR', image: '/images/freshdurian.jpeg', category: 'Durian' },
  { name: 'Wood Apple Cordial', price: '380 LKR', image: '/images/Wood-Apple-Cordial.jpg', category: 'Wood Apple' },
  { name: 'Banana Chips 200g', price: '220 LKR', image: '/images/bananachips.webp', category: 'Banana' },
  { name: 'King Coconut Water', price: '120 LKR', image: '/images/kingcoconut.webp', category: 'Others' }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-gray-900 bg-gradient-to-b from-green-50 to-emerald-50">
      <Nav />

      {/* Hero Section */}
<header
  className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
  style={{ backgroundImage: "url('/images/Header.png')" }}
>
  {/* Subtle overlay: transparent at top so image colors show, gentle tint at bottom for text contrast */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/30"></div>

  <div className="relative z-10 text-center px-6">
    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
      Fresh. Local. Delicious.
    </h1>
    <p className="mt-4 text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
      Handpicked fruits, syrups, cordials & more — straight from Sri Lankan farms.
    </p>

    <div className="mt-6 max-w-xl mx-auto flex bg-white/90 rounded-full overflow-hidden shadow-lg border border-white/40">
      <input
        type="text"
        placeholder="Search jackfruit, durian, banana..."
        className="flex-1 px-5 py-3 focus:outline-none text-gray-800 bg-transparent"
      />
      <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-white font-medium transition shadow-sm">
        Search
      </button>
    </div>
  </div>
</header>


      <main className="max-w-7xl mx-auto px-4 flex-1">
        {/* Categories */}
        <section className="pt-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Shop by Category</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {categories.map((c, i) => {
              const slug = c.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={i}
                  to={`/products?category=${encodeURIComponent(c.name)}#${slug}`}
                  className="min-w-[150px] bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition p-4 flex flex-col items-center gap-3"
                >
                  <img src={c.image} alt={c.name} className="w-28 h-28 rounded-xl object-cover border" />
                  <span className="font-semibold text-gray-700">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular Products */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Popular Right Now</h2>
            <Link to="/products" className="text-sm text-emerald-600 hover:underline">See all</Link>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p, i) => {
              const cat = p.category || 'Others';
              const slug = cat.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={i}
                  to={`/products?category=${encodeURIComponent(cat)}#${slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition overflow-hidden">
                    <div className="h-40 bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{p.name}</h3>
                      <p className="mt-1 text-emerald-600 font-semibold">{p.price}</p>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-700 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Sri Lankan Fruit Market. All rights reserved.</p>
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-emerald-300"><FaFacebookF /></a>
            <a href="#" className="hover:text-emerald-300"><FaInstagram /></a>
            <a href="#" className="hover:text-emerald-300"><FaTwitter /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
