import React, { useEffect, useState } from 'react'
import { fetchOrders, updateOrder } from '../../Apis/SupplierApi'
import Header from '../../components/Supplier/Header'
import Nav from '../../components/Supplier/Nav'
import Footer from '../../components/Supplier/Footer'

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetchOrders()
      setOrders(res.data)
    } catch (err) { console.error(err) }
  }

  const updateStatus = async (id, status) => {
    try {
      await updateOrder(id, { status })
      load()
    } catch (err) { console.error(err) }
  }

  return (
    <>
      <Header />
      <Nav />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Purchase Orders & Tracking</h1>
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{o.orderId} - {o.fruit}</h2>
                  <p className="text-sm">Supplier: {o.supplier?.name || 'N/A'}</p>
                  <p className="text-sm">Quantity: {o.quantity}</p>
                  <p className="text-sm">Total: ${o.totalAmount}</p>
                </div>
                <div className="text-right">
                  <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} className="p-2 border rounded">
                    <option value="Requested">Requested</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}