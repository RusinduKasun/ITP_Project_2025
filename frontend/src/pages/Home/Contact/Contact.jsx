import React, { useState } from 'react';
import './Contact.css';
import Nav from "../Nav/Nav";
import Footer from '../Footer/Footer';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formData;
    const phoneNumber = '94711701408'; // ✅ WhatsApp number without + or spaces
    const text = `Hello Taste of Ceylon! 🌱\n\nMy Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div>
      <Nav />

      {/* Hero Section */}
      <div className="contact-hero">
        <h1>Contact Taste of Ceylon</h1>
        <p>
          We’d love to hear from you 🍃 — whether you have questions about our products,
          suppliers, or partnerships, we’re just a message away!
        </p>
      </div>

      {/* Contact Container */}
      <div className="contact-container">
        {/* Left - Form */}
        <div className="contact-left">
          <h2>Get in Touch</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>

        {/* Right - Details & Map */}
        <div className="contact-right">
          <h2>Reach Us</h2>
          <div className="contact-card">
            <p><strong>📍 Address:</strong> Colombo, Sri Lanka</p>
            <p><strong>📞 Phone:</strong> +94 71 234 5678</p>
            <p><strong>📧 Email:</strong> tasteofceylon@gmail.com</p>
            <p><strong>🌐 Social:</strong></p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-whatsapp"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>

          {/* Map */}
          <div className="map-container">
            <iframe
              title="Taste of Ceylon Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63330.22625711621!2d79.84440572673762!3d6.927078907730728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2595c1e1b1c6d%3A0xf74fa6d57909f2cb!2sColombo!5e0!3m2!1sen!2slk!4v1710000000000!5m2!1sen!2slk"
              width="100%"
              height="250"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
