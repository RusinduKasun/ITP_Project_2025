import React, { useState } from 'react'
import Modal from 'react-modal'
import { updateSupplier, deleteSupplier } from '../../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faTrash, faPhone, faEnvelope, faMapMarkerAlt, faAppleAlt, faPlus } from '@fortawesome/free-solid-svg-icons'

Modal.setAppElement('#root')

export default function SupplierCard({ supplier, onUpdate }) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    supplierId: supplier.supplierId || '',
    name: supplier.name,
    phone: supplier.phone || '',
    email: supplier.email || '',
    address: supplier.address || '',
    fruits: supplier.fruits || [],
    priceList: (supplier.priceList || []).map(p => ({ fruit: p.fruit, pricePerKg: p.pricePerUnit.toString() || '' })),
    bankDetails: supplier.bankDetails || { bankName: '', accountNumber: '', branch: '' },
    status: supplier.status || 'Active',
    notes: supplier.notes || ''
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500 text-white'
      case 'Pending': return 'bg-yellow-500 text-white'
      case 'Inactive': return 'bg-red-500 text-white'
      default: return 'bg-green-500 text-white'
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const validPriceList = editForm.priceList.filter(item => item.fruit && item.pricePerKg).map(item => ({
        fruit: item.fruit.trim(),
        pricePerUnit: parseFloat(item.pricePerKg) || 0
      }))
      const uniqueFruits = [...new Set(validPriceList.map(item => item.fruit))]
      await updateSupplier(supplier._id, {
        ...editForm,
        fruits: uniqueFruits,
        priceList: validPriceList,
        bankDetails: {
          bankName: editForm.bankDetails.bankName || '',
          accountNumber: editForm.bankDetails.accountNumber || '',
          branch: editForm.bankDetails.branch || ''
        }
      })
      setModalIsOpen(false)
      if (typeof onUpdate === 'function') onUpdate()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      try {
        await deleteSupplier(supplier._id)
        if (typeof onUpdate === 'function') onUpdate()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const openModal = () => setModalIsOpen(true)
  const closeModal = () => setModalIsOpen(false)

  const updateField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const updateBankField = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }))
  }

  const updatePriceEntry = (index, field, value) => {
    setEditForm(prev => {
      const newPriceList = [...prev.priceList]
      newPriceList[index][field] = value
      return { ...prev, priceList: newPriceList }
    })
  }

  const addPriceEntry = () => {
    setEditForm(prev => ({
      ...prev,
      priceList: [...prev.priceList, { fruit: '', pricePerKg: '' }]
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">
            {supplier.name}
          </h2>
          <span className="text-sm text-gray-500">{supplier.supplierId}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(supplier.status)}`}>
          {supplier.status}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-3 text-gray-400" />
          <span>{supplier.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-3 text-gray-400" />
          <span>{supplier.email || 'N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-3 text-gray-400" />
          <span>{supplier.address || 'N/A'}</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <FontAwesomeIcon icon={faAppleAlt} className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">Fruits Available</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {supplier.fruits && supplier.fruits.length > 0 ? (
            supplier.fruits.map((fruit, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {fruit}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No fruits listed</span>
          )}
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-500 mb-6">
        <span>{supplier.orderCount || 0} orders</span>
        <span>Last: {supplier.lastOrderDate || 'N/A'}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={openModal}
          className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faPencilAlt} className="w-4 h-4 mr-2" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-white border border-gray-200 text-red-600 p-2.5 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
        </button>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-20 max-h-[80vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-600">Edit Supplier: {supplier.name}</h2>
          <button onClick={closeModal} className="text-text-secondary hover:text-destructive-red">&times;</button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-primary-600 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">Supplier ID</label>
                <input
                  value={editForm.supplierId}
                  disabled
                  className="p-2 border rounded w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Supplier Name *</label>
                <input
                  value={editForm.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Status *</label>
                <select
                  value={editForm.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Phone Number</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary">Email Address</label>
                <input
                  value={editForm.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary">Address</label>
                <input
                  value={editForm.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary-600 mb-2">Fruit Catalog & Pricing</h3>
            {editForm.priceList.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                <input
                  value={item.fruit}
                  onChange={(e) => updatePriceEntry(index, 'fruit', e.target.value)}
                  placeholder="Fruit name"
                  className="p-2 border rounded"
                />
                <div className="flex items-center">
                  <input
                    type="number"
                    value={item.pricePerKg}
                    onChange={(e) => updatePriceEntry(index, 'pricePerKg', e.target.value)}
                    placeholder="Price per kg (Rs)"
                    className="p-2 border rounded flex-grow mr-2"
                  />
                  {index === editForm.priceList.length - 1 && (
                    <button
                      type="button"
                      onClick={addPriceEntry}
                      className="bg-primary-500 text-white p-2 rounded hover:bg-primary-700"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary-600 mb-2">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary">Bank Name</label>
                <input
                  value={editForm.bankDetails.bankName}
                  onChange={(e) => updateBankField('bankName', e.target.value)}
                  placeholder="Bank name"
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary">Account Number</label>
                <input
                  value={editForm.bankDetails.accountNumber}
                  onChange={(e) => updateBankField('accountNumber', e.target.value)}
                  placeholder="Account number"
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary">Branch</label>
                <input
                  value={editForm.bankDetails.branch}
                  onChange={(e) => updateBankField('branch', e.target.value)}
                  placeholder="Branch details"
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary-600 mb-2">Additional Notes</h3>
            <textarea
              value={editForm.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional information about the supplier"
              className="p-2 border rounded w-full h-24"
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-300 text-text-primary p-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-500 text-white p-2 rounded hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}