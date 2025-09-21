import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-2xl font-extrabold">Taste of Ceylon</div>
          <p className="mt-2 text-sm text-gray-600">Handmade syrups, chips and cordials — straight from Sri Lankan farms.</p>
        </div>

        <div className="flex gap-6 justify-between md:justify-center">
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Help</Link></li>
              <li><Link to="/contact">Shipping</Link></li>
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Stay in touch</h4>
          <p className="mb-3">Sign up for offers and product updates.</p>
          <form className="flex gap-2">
            <input aria-label="Email" placeholder="you@email.com" className="flex-1 px-3 py-2 rounded-md border" />
            <button className="bg-emerald-600 text-white px-3 py-2 rounded-md">Subscribe</button>
          </form>
        </div>
      </div>
      
      
    
      
     
    </footer>
  );
}
