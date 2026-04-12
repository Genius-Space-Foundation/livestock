'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  MoreVertical,
  Filter
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import styles from './plans.module.css';

export default function AdminPlansPage() {
  const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    image: '',
    description: '',
    duration: '4 months',
    price: 100,
    roiPercentage: 30,
    status: 'active'
  });

  const handleDurationChange = (e) => {
    const val = e.target.value;
    const match = val.match(/\d+/);
    let newRoi = formData.roiPercentage;
    if (match) {
      const months = parseInt(match[0]);
      if (months > 0) {
        // Calculate ROI directly proportional to short maturity: e.g., 120 / months
        // Example: 4 months -> 30%, 6 months -> 20%, 12 months -> 10%
        newRoi = Math.round(120 / months);
      }
    }
    setFormData({ ...formData, duration: val, roiPercentage: newRoi });
  };

  const filteredPlans = plans.filter(p => 
    p.type.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        type: plan.type,
        image: plan.image || '',
        description: plan.description,
        duration: plan.duration,
        price: plan.price,
        roiPercentage: plan.roiPercentage || 20,
        status: plan.status.toLowerCase()
      });
    } else {
      setEditingPlan(null);
      setFormData({
        type: '',
        image: '',
        description: '',
        duration: '4 months',
        price: 100,
        roiPercentage: 30,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingPlan) {
      await updatePlan(editingPlan.id, formData);
    } else {
      await addPlan(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      await deletePlan(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Livestock Plans</h1>
          <p className="page-subtitle">Configure your investment offerings</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> New Plan
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search plans..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost btn-sm">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Duration</th>
              <th>ROI</th>
              <th>Price</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <div className={styles.typeCell}>
                      <img src={plan.image} alt="" className={styles.planIcon} />
                      <strong>{plan.type}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="truncate" style={{ maxWidth: '240px' }} title={plan.description}>
                      {plan.description}
                    </div>
                  </td>
                  <td>{plan.duration}</td>
                  <td>{plan.roiPercentage || 20}%</td>
                  <td>GHS {plan.price}</td>
                  <td>
                    <button 
                      className={styles.toggleBtn} 
                      onClick={() => togglePlanStatus(plan.id)}
                      title="Toggle Visibility"
                    >
                      {plan.status.toLowerCase() === 'active' ? (
                        <div className="flex items-center gap-sm text-success">
                          <ToggleRight size={24} />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-sm text-muted">
                          <ToggleLeft size={24} />
                          <span>Inactive</span>
                        </div>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => handleOpenModal(plan)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(plan.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="empty-state">
                    <p>No investment plans found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Investment Plan' : 'Create New Plan'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </>
        }
      >
        <form className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Livestock Type</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Poultry, Rabbit, Ostrich..."
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Plan Image URL</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="Detail the operation specifics..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex gap-md">
            <div className="form-group flex-1">
              <label className="form-label">Duration</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 6 months"
                value={formData.duration}
                onChange={handleDurationChange}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">ROI (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.roiPercentage}
                onChange={(e) => setFormData({...formData, roiPercentage: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="flex gap-md">
            <div className="form-group flex-1">
              <label className="form-label">Min. Price (GHS)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Initial Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
