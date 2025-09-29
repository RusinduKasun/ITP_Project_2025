# Taste of Ceylon 🍃
<img width="1817" height="802" alt="image" src="https://github.com/user-attachments/assets/db695298-b992-4d60-898a-216be03f6f61" />
<br/>
<br/>
<br/>
A full-stack fruit supply chain management system for Sri Lankan fruit businesses, built with React, Node.js, Express, and MongoDB.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## About

**Taste of Ceylon** is a comprehensive platform for managing fruit suppliers, inventory, orders, finance, and customer engagement. It empowers local farmers and businesses to streamline operations, reduce wastage, and connect with customers.

---

## Features

- 🌱 **Supplier Management**: Add, edit, and manage fruit suppliers and their price lists.
- 📦 **Inventory Tracking**: Real-time fruit stock, reorder levels, and expiry management.
- 🛒 **Customer Ordering**: Browse products, add to cart, checkout, and track orders.
- 💸 **Finance Module**: Income, expenses, break-even analysis, and financial reports.
- 📊 **Reports & Analytics**: Downloadable PDF/Excel reports for inventory, orders, and finance.
- 🔔 **Notifications**: Real-time notifications for inventory and order updates.
- 🤖 **AI Chatbot**: Customer support chatbot for product and order queries.
- 🛡️ **Admin Panel**: User management, authentication, and role-based access.

---

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **PDF/Excel Export**: jsPDF, autoTable, SheetJS
- **Other**: SweetAlert2, React Router, dotenv

---

## Project Structure

```
backend/
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  ├── scripts/
  ├── config/
  ├── uploads/
  └── server.js
frontend/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── styles/
  │   └── App.jsx
  ├── index.html
  └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/taste-of-ceylon.git
cd taste-of-ceylon
```

### 2. Setup Backend

```sh
cd backend
npm install
cp .env.example .env   # Set your MongoDB URI and other secrets
npm run seed           # (Optional) Seed initial users
npm start
```

### 3. Setup Frontend

```sh
cd ../frontend
npm install
cp .env.example .env   # Set API base URLs if needed
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) and backend at [http://localhost:5000](http://localhost:5000).

---

## Scripts

- **Backend**
  - `npm start` — Start Express server
  - `npm run seed` — Seed admin/users
- **Frontend**
  - `npm run dev` — Start React dev server
  - `npm run build` — Build for production

---



---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License


[MIT](LICENSE)

---
<p align="center">  
  Made with ❤️ by the Taste of Ceylon Team  
</p>

