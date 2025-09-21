import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wastage.css';
import WastageAnalytics from '../../components/analytics/WastageAnalytics';

const WASTAGE_CATEGORIES = {
  'Collection/Transport': [
    'Damaged during transport',
    'Delays in collection',
    'Improper handling',
    'Temperature exposure',
    'Other transport issues'
  ],
  'Stocking/Storage': [
    'Natural rotting',
    'Expired before processing',
    'Temperature control issues',
    'Pest damage',
    'Improper storage conditions',
    'Other storage issues'
  ],
  'Processing/Production': [
    'Peels and seeds wastage',
    'Processing mistakes',
    'Equipment malfunction',
    'Quality control rejection',
    'Other production issues'
  ]
};

const FRUIT_CATEGORIES = [
  'Jackfruit',
  'Wood Apple',
  'Durian',
  'Banana',
  'Other'
];

export default function Wastage() {
  const initialFormState = {
    fruitType: '',
    category: '',
    specificReason: '',
    quantity: '',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const [wastageRecords, setWastageRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specificReasons, setSpecificReasons] = useState([]);

  // Update specific reasons when category changes
  useEffect(() => {
    if (formData.category) {
      setSpecificReasons(WASTAGE_CATEGORIES[formData.category] || []);
      setFormData(prev => ({ ...prev, specificReason: '' }));
    }
  }, [formData.category]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        wastageCost: parseFloat(formData.quantity) * parseFloat(formData.unitPrice)
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/wastage/${editingId}`, dataToSubmit);
      } else {
        await axios.post('http://localhost:5000/api/wastage', dataToSubmit);
      }
      
      await fetchWastageRecords();
      resetForm();
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving wastage record');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setEditingId(record._id);
    setFormData({
      fruitType: record.fruitType,
      category: record.category,
      specificReason: record.specificReason,
      quantity: record.quantity.toString(),
      unitPrice: record.unitPrice.toString(),
      date: new Date(record.date).toISOString().split('T')[0],
      notes: record.notes || ''
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.fruitType) {
      setError('Please select a fruit type');
      return false;
    }
    if (!formData.category) {
      setError('Please select a wastage category');
      return false;
    }
    if (!formData.specificReason) {
      setError('Please select a specific reason');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (!formData.unitPrice || formData.unitPrice <= 0) {
      setError('Please enter a valid unit price');
      return false;
    }
    return true;
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError(null);
  };

  // Fetch wastage records
  const fetchWastageRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/wastage');
      setWastageRecords(response.data);
    } catch (err) {
      setError('Error fetching wastage records');
    }
  };

  // Delete wastage record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/wastage/${id}`);
      await fetchWastageRecords();
    } catch (err) {
      setError('Error deleting wastage record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWastageRecords();
  }, []);

  return (
    <div className="wastage-container">
      <h2>Wastage Calculator</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Wastage Recording Form */}
      <form className="wastage-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Fruit Type</label>
            <select
              value={formData.fruitType}
              onChange={(e) => setFormData({ ...formData, fruitType: e.target.value })}
              required
            >
              <option value="">Select Fruit Type</option>
              {FRUIT_CATEGORIES.map((fruit) => (
                <option key={fruit} value={fruit}>{fruit}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Wastage Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(WASTAGE_CATEGORIES).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Specific Reason</label>
            <select
              value={formData.specificReason}
              onChange={(e) => setFormData({ ...formData, specificReason: e.target.value })}
              required
              disabled={!formData.category}
            >
              <option value="">Select Specific Reason</option>
              {specificReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity (kg)</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Unit Price (Rs)</label>
            <input
              type="number"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes about the wastage..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update Wastage' : 'Record Wastage'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={loading}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Wastage Records Table */}
      <div className="wastage-records">
        <h3>Recent Wastage Records</h3>
        {wastageRecords.length === 0 ? (
          <p>No wastage records found.</p>
        ) : (
          <table className="wastage-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fruit Type</th>
                <th>Category</th>
                <th>Reason</th>
                <th>Quantity (kg)</th>
                <th>Unit Price (Rs)</th>
                <th>Total Loss (Rs)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wastageRecords.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.fruitType}</td>
                  <td>{record.category}</td>
                  <td>{record.specificReason}</td>
                  <td>{record.quantity.toFixed(2)}</td>
                  <td>{record.unitPrice.toFixed(2)}</td>
                  <td>Rs. {(record.quantity * record.unitPrice).toFixed(2)}</td>
                  <td className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(record)} 
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(record._id)} 
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Total Wastage Cost:
                </td>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>
                  Rs. {wastageRecords.reduce((total, record) => 
                    total + (record.quantity * record.unitPrice), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Analytics Dashboard */}
        {wastageRecords.length > 0 && (
          <WastageAnalytics wastageRecords={wastageRecords} />
        )}
      </div>
    </div>
  );
}
