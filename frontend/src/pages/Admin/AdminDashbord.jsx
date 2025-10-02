import React from 'react'
import './AdminDashboard.css'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
    const navigate = useNavigate()

    const handleCardClick = (path) => {
        navigate(path)
    }

    const handleButtonClick = (title, path, e) => {
        e.stopPropagation()
        navigate(path)
    }

    const cardsData = [
        {
            title: "Supplier Management",
            description: "Manage suppliers, track performance, and maintain vendor relationships",
            icon: "🏭",
            color: "#eeeeeeff",
            path: "/suppliersDash"
        },
        {
            title: "Finance Management",
            description: "Track expenses, revenue, invoices, and financial reports",
            icon: "💰",
            color: "#F44336",
            path: "/financeDash"
        },
        {
            title: "Customer Management",
            description: "Handle customer data, support tickets, and customer interactions",
            icon: "👥",
            color: "#FF9800",
            path: "/customers"
        },
        {
            title: "Inventory Management",
            description: "Monitor stock levels, manage products, and track inventory movement",
            icon: "📊",
            color: "#607D8B",
            path: "/inventory"
        }
    ]

    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <div className="cards-container">
                {cardsData.map((card, index) => (
                    <div
                        key={index}
                        className="management-card"
                        onClick={() => handleCardClick(card.path)}
                    >
                        <div
                            className="card-icon"
                            style={{ backgroundColor: card.color }}
                        >
                            {card.icon}
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-description">{card.description}</p>
                        </div>
                        <button
                            className="card-button"
                            onClick={(e) => handleButtonClick(card.title, card.path, e)}
                        >
                            Manage
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminDashboard