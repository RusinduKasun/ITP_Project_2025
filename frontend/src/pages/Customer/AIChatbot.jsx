import React, { useState, useRef, useEffect } from 'react';
import productKnowledge from './productKnowledgeBase.json';
import './AIChatbot.css';

const welcomeMessage = 'Hi! Welcome Taste of Ceylon..! I am your AI assistant. Ask me anything about our products, orders, or Sri Lankan fruits!';

const exampleResponses = {
  'jackfruit': 'Jackfruit is a tropical fruit rich in fiber and vitamins. We offer noodles, chips, and curry made from jackfruit.',
  'order': 'To place an order, add products to your cart and proceed to checkout. You can track your order from the order summary page.',
  'shipping': 'We deliver island-wide in Sri Lanka. Shipping charges depend on your location and order size.',
  'payment': 'We accept credit/debit cards and cash on delivery. Your payment is secure with us.',
  'fruit': 'We specialize in Sri Lankan fruits like jackfruit, wood apple, durian, and banana. Ask about any product!'
};


function getAIResponse(message) {
  const lower = message.toLowerCase();
  // Try to match product name
  const product = productKnowledge.find(p => lower.includes(p.name.toLowerCase()));
  if (product) {
    return `Product: ${product.name}\nPrice: ${product.price}\n${product.description}\nBenefits: ${product.benefits.join(", ")}\nUsage: ${product.usage}`;
  }
  // Fallback to example responses
  for (const key in exampleResponses) {
    if (lower.includes(key)) return exampleResponses[key];
  }
  return "I'm here to help! Please ask about products, orders, or Sri Lankan fruits.";
}

const AIChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: welcomeMessage }]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: getAIResponse(input) }]);
    }, 600);
    setInput('');
  };

  return (
    <div className="chatbot-container" style={{ width: 320, height: 420, minHeight: 320, maxHeight: 420, display: 'flex', flexDirection: 'column', position: 'fixed', bottom: 80, right: 24, zIndex: 1200 }}>
      <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>AI Chatbot</span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', marginLeft: 8 }} aria-label="Close Chatbot">×</button>
        )}
      </div>
      <div className="chatbot-messages" style={{ flex: 1, overflowY: 'auto', maxHeight: 320, minHeight: 0 }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-msg ${msg.sender}`}>{msg.text}</div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form className="chatbot-inputbox" onSubmit={sendMessage} style={{ marginTop: 'auto' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default AIChatbot;
