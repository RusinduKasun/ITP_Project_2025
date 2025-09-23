import React from 'react';
import './About.css';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';

function About() {
  return (
    <div>
      <Nav />
      <div className="about-container">
        
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Taste of Ceylon</h1>
          <p className="hero-subtitle">
            Bringing the flavors of Sri Lanka’s finest seasonal fruits to the world 🌱🍍🍌
          </p>
        </section>

        {/* Our Story */}
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            <strong>Taste of Ceylon</strong> was founded with a mission to reduce fruit wastage by
            transforming raw, locally sourced fruits into high-quality, value-added products.
            We produce jackfruit (chips, noodles, cordial, raw fruit), wood apple (jam, juice, cordial),
            durian (syrup, juice, raw fruit), and banana (chips, juice, raw fruit) for both local and
            international markets. By working directly with small-scale suppliers, we promote fair trade,
            ethical sourcing, and the empowerment of rural communities.
          </p>
        </section>

        {/* Features / Functions */}
        <section className="about-section features">
          <h2>What We Do</h2>
          <div className="feature-cards">
            <div className="card">👥 User Management</div>
            <div className="card">🚚 Supplier Management</div>
            <div className="card">📦 Order Management</div>
            <div className="card">🏭 Inventory Management</div>
            <div className="card">💰 Finance Management</div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section mission">
          <h2>Our Mission</h2>
          <p>
            To create a sustainable fruit management ecosystem where farmers, suppliers, and customers
            benefit while minimizing waste and maximizing quality.
          </p>
        </section>

        {/* Contact Section */}
        <section className="about-section contact">
          <h2>Contact Us</h2>
          <p><strong>📍 Address:</strong> Gatamanna, Matara, Sri Lanka</p>
          <p><strong>📞 Phone:</strong> +94 71 234 5678</p>
          <p><strong>📧 Email:</strong> info@tasteofceylon.com</p>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default About;
