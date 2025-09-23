import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../Nav/Nav.jsx';

const categories = [
  { name: 'Jackfruit', image: '/images/jackcat.jpeg' },
  { name: 'Wood Apple', image: '/images/woodapplecat.webp' },
  { name: 'Durian', image: '/images/duriancat.jpeg' },
  { name: 'Banana', image: '/images/bananacat.webp' },
  { name: 'Others', image: '/images/othercat.webp' }
];

const deals = [
  { title: 'Weekend Mega Sale', subtitle: 'Up to 60% off', image: '/images/bananachips.webp' },
  { title: 'Fresh Packs', subtitle: 'Buy 1 Get 1', image: '/images/freshdurian.jpeg' },
  { title: 'Cordials & Syrups', subtitle: 'From 199 LKR', image: '/images/woodapplejuice.jpg' }
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
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />
      {/* Hero */}
      <header className="bg-gradient-to-b from-emerald-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Daily deals on fresh, local flavors</h1>
              <p className="mt-4 text-white/90 max-w-2xl">Discover handcrafted syrups, cordials, chips and more — straight from Sri Lankan farms. Limited-time offers updated daily.</p>

              <div className="mt-6 flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 bg-white rounded-lg overflow-hidden flex items-center shadow-sm">
                  <input aria-label="Search products" placeholder="Search jackfruit, durian, banana..." className="flex-1 px-4 py-3 text-gray-800 focus:outline-none" />
                  <button className="bg-emerald-600 text-white px-5 py-3">Search</button>
                </div>

                {/* CTAs removed as requested */}
              </div>

              
            </div>

            <div className="md:col-span-5">
              <div className="bg-white rounded-xl p-4 text-gray-900 shadow-lg">
                <div className="flex items-center gap-3">
                  <img src="/images/bananacat.webp" alt="promo" className="w-24 h-24 object-cover rounded-lg" />
                  <div>
                    <div className="text-sm font-semibold">Weekend Mega Sale</div>
                    <div className="text-lg font-bold text-emerald-600">Up to 60% off</div>
                    <div className="mt-2 text-sm">Selected snacks and cordials — grab while stock lasts.</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <img src="/images/bananachips.webp" alt="p1" className="w-full h-16 object-cover rounded-md" />
                  <img src="/images/woodapplejuice.jpg" alt="p2" className="w-full h-16 object-cover rounded-md" />
                  <img src="/images/duriansyrup.jpg" alt="p3" className="w-full h-16 object-cover rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Categories horizontal */}
        <section className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Shop by category</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((c, i) => {
              const slug = c.name.toLowerCase().replace(/\s+/g, '-');
              return (
              <Link
                key={i}
                to={`/products?category=${encodeURIComponent(c.name)}#${slug}`}
                className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm flex-shrink-0 flex flex-col items-center gap-2"
              >
                <img src={c.image} alt={c.name} className="w-24 h-24 rounded-lg object-cover border" />
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
              )
            })}
          </div>
        </section>

        {/* Hot deals removed per request */}

        {/* Product grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Popular right now</h2>
            <Link to="/products" className="text-sm text-emerald-600">See all</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p, i) => {
              const cat = p.category || 'Others';
              const slug = cat.toLowerCase().replace(/\s+/g, '-');
              return (
                <div key={i} className="block" aria-label={`View ${p.name} in ${cat} category`}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat)}#${slug}`}
                    className="block"
                  >
                    <article className="bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150">

                      <div className="w-full h-36 overflow-hidden rounded-md mb-3 bg-gray-100">
                        <img loading="lazy" src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800 truncate">{p.name}</h3>
                          <div className="mt-1 text-sm text-gray-600">{p.price}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Link to={`/products?search=${encodeURIComponent(p.name)}`} className="text-xs text-emerald-600 hover:underline" aria-label={`View ${p.name}`}>
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        
      </main>

      
    </div>
  );
}
