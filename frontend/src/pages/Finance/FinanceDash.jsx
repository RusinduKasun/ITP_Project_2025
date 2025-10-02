import React, { useEffect, useState } from 'react'
import { fetchOrders, updateOrder } from '../../Apis/SupplierApi'
import Header from "../../components/Finance/layout/Header";
import Sidebar from "../../components/Finance/layout/Sidebar";
import Nav from "../Home/Nav/Nav.jsx";

function FinanceDash() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [paymentSuccess, setPaymentSuccess] = useState(null);

    useEffect(() => {
        fetchOrders()
            .then(res => {
                setOrders(res.data)
                setLoading(false)
            })
            .catch(err => {
                setError('Failed to fetch orders')
                setLoading(false)
            })
    }, [])

    const handlePay = async (orderId) => {
        try {
            await updateOrder(orderId, { paymentStatus: 'Paid', status: 'approved' });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId
                        ? { ...order, paymentStatus: 'Paid', status: 'approved' }
                        : order
                )
            );
            setPaymentSuccess('Payment Success');
            setTimeout(() => setPaymentSuccess(null), 2000);
        } catch (err) {
            setPaymentSuccess('Payment Failed');
            setTimeout(() => setPaymentSuccess(null), 2000);
        }
    };

    return (
        <>
            {/* Site navigation */}
            <div className="fixed w-full z-30 top-0">
                <Nav />
            </div>

            {/* Finance header positioned below Nav */}
            <div className="fixed w-full z-20 top-16">
                <Header />
            </div>

            {/* Sidebar positioned below Nav + Header */}
            <div className="fixed top-32 left-0 z-10">
                <Sidebar />
            </div>

            {/* Main content area: add top padding to clear Nav + Header and left padding for sidebar */}
            <div className="pl-64 pt-36 app-container">
                <div className="content-wrapper">
                    <div className="main-content">
                        <div className="container">
                          <h2 className="font-bold text-xl">Supplier Payment Details</h2>

                        {paymentSuccess && (
                            <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded">
                                {paymentSuccess}
                            </div>
                        )}
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <table className="w-full mt-5 border border-gray-300 border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300 px-3 py-2">Order ID</th>
                                        <th className="border border-gray-300 px-3 py-2">Fruit</th>
                                        <th className="border border-gray-300 px-3 py-2">Quantity</th>
                                        <th className="border border-gray-300 px-3 py-2">Supplier</th>
                                        <th className="border border-gray-300 px-3 py-2">Delivery Date</th>
                                        <th className="border border-gray-300 px-3 py-2">Total Price</th>
                                        <th className="border border-gray-300 px-3 py-2">Status</th>
                                        <th className="border border-gray-300 px-3 py-2">Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td className="border border-gray-300 px-3 py-2">{order.orderId}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.fruit}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.quantity}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.supplier?.name || '-'}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.totalPrice}</td>
                                            <td className="border border-gray-300 px-3 py-2">{order.status}</td>
                                            <td className="border border-gray-300 px-3 py-2">
                                                <button
                                                    className={`px-4 py-2 rounded transition ${(order.paymentStatus === 'Paid' || order.status === 'approved')
                                                            ? 'bg-gray-400 text-white cursor-default'
                                                            : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                                                        }`}
                                                    onClick={() => handlePay(order._id)}
                                                    disabled={order.paymentStatus === 'Paid' || order.status === 'approved'}
                                                >
                                                    {(order.paymentStatus === 'Paid' || order.status === 'approved') ? 'Paid' : 'Pay'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FinanceDash
