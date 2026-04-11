'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  Megaphone, 
  Plus, 
  Image as ImageIcon, 
  Trash2,
  Calendar,
  Eye
} from 'lucide-react';
import Modal from '@/components/Modal';
import styles from './updates.module.css';

export default function AdminUpdatesPage() {
  const { updates, addUpdate } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '/images/poultry.jpg' // Default for now
  });

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    await addUpdate(formData);
    setFormData({ title: '', description: '', image: '/images/poultry.jpg' });
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Farm Updates</h1>
          <p className="page-subtitle">Post milestones and progress to your investors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Update
        </button>
      </div>

      <div className={styles.updatesGrid}>
        {updates.length > 0 ? (
          updates.map((update) => (
            <div key={update.id} className="card">
              <img src={update.image} alt={update.title} className={styles.updateImg} />
              <div className={styles.updateContent}>
                <div className={styles.updateMeta}>
                  <Calendar size={14} />
                  <span>{update.date}</span>
                </div>
                <h3>{update.title}</h3>
                <p>{update.description}</p>
                <div className={styles.updateActions}>
                  <button className="btn btn-ghost btn-sm">
                    <Eye size={14} /> View
                  </button>
                  <button className="btn btn-ghost btn-sm text-danger">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state container" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">📢</div>
            <h3 className="empty-state-title">No Updates Posted</h3>
            <p>Keep your investors engaged by posting regular updates from the farm.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Farm Update"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePostUpdate}>Post Update</button>
          </>
        }
      >
        <form className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Update Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Poultry Farm Vaccination Cycle"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <div className="flex gap-sm">
              <input 
                type="text" 
                className="form-input" 
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
              <div className={styles.imagePreview}>
                <ImageIcon size={18} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="What happened on the farm today?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
