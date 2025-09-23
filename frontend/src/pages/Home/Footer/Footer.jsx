import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-section contact">
        <h3>Contact Us</h3>
        <p>📞 Tel: +94 76 123 4567</p>
        <p>📱 WhatsApp: +94 76 123 4567</p>
        <p>📧 Email: contact@hotelx.com</p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">🌐 Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
          <a href="https://wa.me/94761234567" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
        </div>
      </div>

      <div className="footer-section map">
        <h3>Our Location</h3>
        <iframe
          title="HotelX Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63312.48282006681!2d79.84190125!3d6.92707805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b9613c129%3A0x38dcf2df826b2d7f!2sColombo!5e0!3m2!1sen!2slk!4v1710538384954"
          width="100%"
          height="150"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      <div className="footer-section calendar">
        <h3>Calendar</h3>
        <input type="date" className="calendar-input" />
      </div>

      <div className="footer-bottom">
        <p>© 2025 HotelX. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;




