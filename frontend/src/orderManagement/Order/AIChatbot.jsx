import React, { useState, useRef, useEffect } from 'react';
import productData from './productKnowledgeBase.json';
import './AIChatbot.css';

const welcomeMessage = 'Hi! Welcome Taste of Ceylon..! I am your AI assistant. Ask me anything about our products, orders, or Sri Lankan fruits!';

const generalResponses = [
  {
    keywords: ["order", "track"],
    response: "To place an order, add products to your cart and proceed to checkout. You can track your order from the order summary page."
  },
  {
    keywords: ["shipping", "delivery"],
    response: "We deliver island-wide in Sri Lanka. Shipping charges depend on your location and order size."
  },
  {
    keywords: ["payment", "pay"],
    response: "We accept credit/debit cards and cash on delivery. Your payment is secure with us."
  },
  {
    keywords: ["supplier", "register", "earnings", "delivery schedule"],
    response: "Suppliers can register via the supplier portal, view earnings, and check delivery schedules. Contact support for more info."
  },
  {
    keywords: ["admin", "dashboard", "inventory", "finance", "staff"],
    response: "Admins and staff can access dashboards for inventory and finance updates. Quick links are available in the dashboard menu."
  },
  {
    keywords: ["mission", "community", "fair trade", "story"],
    response: "Taste of Ceylon empowers local farmers, reduces fruit wastage, and supports fair trade. Learn more on our About Us page."
  }
];

function getAIResponse(message) {
  const lower = message.toLowerCase();
  // Product Q&A
  for (const product of productData) {
    if (lower.includes(product.name.toLowerCase())) {
      return `${product.name} (${product.price}):\n${product.description}\nBenefits: ${product.benefits.join(", ")}\nUsage: ${product.usage}`;
    }
  }
  // Snacks Q&A
  if (lower.includes("snack") || lower.includes("chips")) {
    const snacks = productData.filter(p => p.name.toLowerCase().includes("chips"));
    return snacks.map(s => `${s.name} (${s.price}) – ${s.description}`).join("\n");
  }
  // General responses
  for (const item of generalResponses) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.response;
    }
  }
  // Fruit Q&A
  if (lower.includes("fruit")) {
    return "We specialize in Sri Lankan fruits like jackfruit, wood apple, durian, and banana. Ask about any product!";
  }
  // Fallback
  return "I'm here to help! Please ask about products, orders, suppliers, or our company.";
}

const AIChatbot = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: welcomeMessage }]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

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
    <>
      {!open && (
        <button className="chatbot-fab" onClick={() => setOpen(true)} title="Open Chatbot">
          💬
        </button>
      )}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            AI Chatbot
            <button className="chatbot-close" onClick={() => setOpen(false)} title="Close">×</button>
          </div>
          <div className="chatbot-messages chatbot-scrollable">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg ${msg.sender}`}>{msg.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="chatbot-inputbox" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
