// Suppliers.jsx
import React, { useEffect, useState } from 'react'
import { fetchSuppliers, createSupplier } from '../../Apis/SupplierApi'
import SupplierCard from '../../components/Supplier/SupplierCard'
import Modal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faPlus, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../../components/Supplier/Header'
import Nav from '../../components/Supplier/Nav'
import Footer from '../../components/Supplier/Footer'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-destructive-red text-center font-medium">Something went wrong. Please try again later.</h2>
        </div>
      )
    }
    return this.props.children
  }
}

Modal.setAppElement('#root')

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    fruits: [],
    priceList: [{ fruit: '', pricePerKg: '' }],
    bankDetails: { bankName: '', accountNumber: '', branch: '' },
    status: 'Active',
    notes: ''
  })
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFruit, setFilterFruit] = useState('')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const filtered = suppliers.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterFruit ? s.fruits.includes(filterFruit) : true)
    )
    setFilteredSuppliers(filtered)
  }, [searchQuery, filterFruit, suppliers])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetchSuppliers()
      setSuppliers(res.data)
      setFilteredSuppliers(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load suppliers. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Validation function
  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Supplier name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\+?\d{9,15}$/.test(form.phone.trim().replace(/\s/g, ''))) newErrors.phone = 'Enter a valid phone number'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email.trim())) newErrors.email = 'Enter a valid email address'
    if (form.priceList.length === 0 || !form.priceList.some(item => item.fruit && item.pricePerKg)) {
      newErrors.priceList = 'At least one fruit and price is required'
    } else {
      form.priceList.forEach((item, idx) => {
        if (item.fruit && (!item.pricePerKg || isNaN(item.pricePerKg) || Number(item.pricePerKg) <= 0)) {
          newErrors[`priceList_${idx}`] = 'Enter a valid price per kg'
        }
      })
    }
    return newErrors
  }

  const submit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    try {
      const validPriceList = form.priceList.filter(item => item.fruit && item.pricePerKg)
      const uniqueFruits = [...new Set(validPriceList.map(item => item.fruit.trim()))]
      const cleanedForm = {
        ...form,
        fruits: uniqueFruits,
        priceList: validPriceList.map(item => ({
          fruit: item.fruit.trim(),
          pricePerUnit: parseFloat(item.pricePerKg) || 0
        })),
        bankDetails: {
          bankName: form.bankDetails.bankName || '',
          accountNumber: form.bankDetails.accountNumber || '',
          branch: form.bankDetails.branch || ''
        }
      }
      await createSupplier(cleanedForm)
      toast.success('Supplier added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      setForm(prev => ({
        ...prev,
        name: '',
        phone: '',
        email: '',
        address: '',
        priceList: [{ fruit: '', pricePerKg: '' }],
        bankDetails: { bankName: '', accountNumber: '', branch: '' },
        notes: ''
      }))
      setModalIsOpen(false)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add supplier. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const addPriceEntry = () => {
    setForm(prev => ({
      ...prev,
      priceList: [...prev.priceList, { fruit: '', pricePerKg: '' }]
    }))
  }

  const updatePriceEntry = (index, field, value) => {
    setForm(prev => {
      const newPriceList = [...prev.priceList]
      newPriceList[index][field] = value
      return { ...prev, priceList: newPriceList }
    })
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateBankField = (field, value) => {
    setForm(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }))
  }

  const openModal = () => setModalIsOpen(true)
  const closeModal = () => setModalIsOpen(false)

  return (
    <>
      <Header />
      <Nav />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faUsers} className="text-primary-green text-2xl mr-3" />
              <h1 className="text-3xl font-bold text-primary-green">Supplier Registration</h1>
            </div>
            <p className="text-text-secondary">Manage your supplier network and relationships</p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <FontAwesomeIcon icon={faSpinner} spin className="text-primary-green text-4xl mb-4" />
              <p className="text-text-secondary">Loading suppliers...</p>
            </div>
          )}

          {!loading && (
            <ErrorBoundary>
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative flex-1 min-w-0">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search suppliers by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                    <select
                      value={filterFruit}
                      onChange={(e) => setFilterFruit(e.target.value)}
                      className="pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white min-w-[180px]"
                    >
                      <option value="">Filter by Fruit</option>
                      <option value="Apple">Apple</option>
                      <option value="Mango">Mango</option>
                      <option value="Banana">Banana</option>
                      <option value="Avocado">Avocado</option>
                      <option value="Rambutan">Rambutan</option>
                      <option value="Mangosteen">Mangosteen</option>
                    </select>
                  </div>
                  <button
                    onClick={openModal}
                    className="bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-[#266b2a] flex items-center transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Supplier
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-text-secondary">
                    Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>
              </div>
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-24 max-h-[80vh] overflow-y-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary-green">Add New Supplier</h2>
                  <button onClick={closeModal} className="text-text-secondary hover:text-destructive-red">&times;</button>
                </div>
                <form onSubmit={submit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-primary-green mb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">Supplier ID</label>
                        <input
                          value="Auto-generated"
                          disabled
                          className="p-2 border rounded w-full bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">Supplier Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Supplier name"
                          className={`p-2 border rounded w-full ${errors.name ? 'border-red-400' : ''}`}
                          required
                        />
                        {errors.name && <span className="text-destructive-red text-xs">{errors.name}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">Status *</label>
                        <select
                          value={form.status}
                          onChange={(e) => updateField('status', e.target.value)}
                          className="p-2 border rounded w-full"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">Phone Number *</label>
                        <input
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+94 81 234 5678"
                          className={`p-2 border rounded w-full ${errors.phone ? 'border-red-400' : ''}`}
                          required
                        />
                        {errors.phone && <span className="text-destructive-red text-xs">{errors.phone}</span>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-secondary">Email Address *</label>
                        <input
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="info@supplier.lk"
                          className={`p-2 border rounded w-full ${errors.email ? 'border-red-400' : ''}`}
                          required
                        />
                        {errors.email && <span className="text-destructive-red text-xs">{errors.email}</span>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-secondary">Address</label>
                        <input
                          value={form.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          placeholder="Full address including city and postal code"
                          className="p-2 border rounded w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-green mb-2">Fruit Catalog & Pricing</h3>
                    {form.priceList.map((item, index) => (
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
                            className={`p-2 border rounded flex-grow mr-2 ${errors[`priceList_${index}`] ? 'border-red-400' : ''}`}
                          />
                          {index === form.priceList.length - 1 && (
                            <button
                              type="button"
                              onClick={addPriceEntry}
                              className="bg-primary-green text-white p-2 rounded hover:bg-[#266b2a]"
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          )}
                        </div>
                        {errors[`priceList_${index}`] && (
                          <span className="col-span-2 text-destructive-red text-xs">{errors[`priceList_${index}`]}</span>
                        )}
                      </div>
                    ))}
                    {errors.priceList && (
                      <span className="text-destructive-red text-xs">{errors.priceList}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-green mb-2">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-secondary">Bank Name</label>
                        <input
                          value={form.bankDetails.bankName}
                          onChange={(e) => updateBankField('bankName', e.target.value)}
                          placeholder="Bank name"
                          className="p-2 border rounded w-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-secondary">Account Number</label>
                        <input
                          value={form.bankDetails.accountNumber}
                          onChange={(e) => updateBankField('accountNumber', e.target.value)}
                          placeholder="Account number"
                          className="p-2 border rounded w-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-text-secondary">Branch</label>
                        <input
                          value={form.bankDetails.branch}
                          onChange={(e) => updateBankField('branch', e.target.value)}
                          placeholder="Branch details"
                          className="p-2 border rounded w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-green mb-2">Additional Notes</h3>
                    <textarea
                      value={form.notes}
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
                      className="bg-primary-green text-white p-2 rounded hover:bg-[#266b2a]"
                    >
                      Add Supplier
                    </button>
                  </div>
                </form>
              </Modal>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSuppliers.length === 0 && (
                  <div className="col-span-full">
                    <div className="text-center py-16">
                      <div className="text-8xl mb-4">📦</div>
                      <h3 className="text-xl font-medium text-text-primary mb-2">No suppliers found</h3>
                      <p className="text-text-secondary mb-6">
                        {searchQuery || filterFruit
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first supplier'
                        }
                      </p>
                      {!searchQuery && !filterFruit && (
                        <button
                          onClick={openModal}
                          className="bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-[#266b2a] inline-flex items-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Your First Supplier
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {filteredSuppliers.map(s => (
                  <SupplierCard key={s._id} supplier={s} onUpdate={load} />
                ))}
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}