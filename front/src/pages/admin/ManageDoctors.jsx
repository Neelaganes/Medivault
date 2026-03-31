import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMail, FiAward, FiBriefcase, FiX, FiCheck } from 'react-icons/fi';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', specialization: '', licenseNumber: '', experience: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/doctors');
      setDoctors(data.doctors);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/admin/users/${editId}`, formData);
        toast.success('Doctor updated successfully');
      } else {
        await api.post('/admin/users', { ...formData, role: 'doctor' });
        toast.success('Doctor created successfully');
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData({ name: '', email: '', password: '', phone: '', specialization: '', licenseNumber: '', experience: '' });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (doc) => {
    setFormData({
      name: doc.name, email: doc.email, phone: doc.phone || '',
      specialization: doc.specialization || '', licenseNumber: doc.licenseNumber || '', experience: doc.experience || ''
    });
    setEditId(doc._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({ name: '', email: '', password: '', phone: '', specialization: '', licenseNumber: '', experience: '' });
  };

  const getInitialColor = (name) => {
    const colors = ['#3b82f6', '#059669', '#7c3aed', '#ea580c', '#dc2626', '#0891b2', '#c026d3'];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Doctors</h1>
          <p className="admin-page-subtitle">Add, edit, or remove hospital physicians</p>
        </div>
        <button
          className="admin-add-btn"
          onClick={() => { showForm ? handleCancel() : setShowForm(true); }}
        >
          {showForm ? <><FiX size={16} /> Cancel</> : <><FiPlus size={16} /> Add New Doctor</>}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{isEditing ? 'Edit Doctor' : 'Create Doctor Account'}</h2>
          <form onSubmit={handleSubmit} className="admin-form-grid">
            <div className="admin-form-group">
              <label>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Dr. John Doe" />
            </div>
            <div className="admin-form-group">
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@hospital.com" />
            </div>
            {!isEditing && (
              <div className="admin-form-group">
                <label>Initial Password</label>
                <input type="password" name="password" required={!isEditing} value={formData.password} onChange={handleChange} placeholder="Min 6 characters" />
              </div>
            )}
            <div className="admin-form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
            <div className="admin-form-group">
              <label>Specialization</label>
              <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} placeholder="e.g., Cardiology" />
            </div>
            <div className="admin-form-group">
              <label>License Number</label>
              <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleChange} placeholder="e.g., MCI-12345" />
            </div>
            <div className="admin-form-group">
              <label>Years of Experience</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g., 10" />
            </div>
            <div className="admin-form-group full-width">
              <button type="submit" className="admin-submit-btn">
                <FiCheck size={16} />
                {isEditing ? 'Save Changes' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors Table */}
      <div className="admin-table-card">
        {loading ? (
          <div className="admin-table-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-lines">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line long"></div>
                </div>
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill wide"></div>
                <div className="skeleton-btns">
                  <div className="skeleton-btn"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="admin-empty-state">
            <FiBriefcase size={48} />
            <p>No doctors found in the system.</p>
            <button className="admin-add-btn" onClick={() => setShowForm(true)}>
              <FiPlus size={16} /> Add First Doctor
            </button>
          </div>
        ) : (
          <>
            <div className="admin-table-header">
              <div className="col-name">Name & Role</div>
              <div className="col-spec">Specialization</div>
              <div className="col-license">License No.</div>
              <div className="col-contact">Contact</div>
              <div className="col-actions">Actions</div>
            </div>
            {doctors.map(doc => (
              <div key={doc._id} className="admin-table-row">
                <div className="col-name">
                  <div className="table-avatar" style={{ background: getInitialColor(doc.name) }}>
                    {doc.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="table-name">{doc.name}</div>
                    <div className="table-role">Doctor</div>
                  </div>
                </div>
                <div className="col-spec">
                  <span className="info-pill blue">
                    <FiBriefcase size={13} />
                    {doc.specialization || '—'}
                  </span>
                </div>
                <div className="col-license">
                  <span className="info-pill green">
                    <FiAward size={13} />
                    {doc.licenseNumber || '—'}
                  </span>
                </div>
                <div className="col-contact">
                  <span className="info-pill neutral">
                    <FiMail size={13} />
                    {doc.email}
                  </span>
                </div>
                <div className="col-actions">
                  <button className="table-btn edit" onClick={() => handleEdit(doc)}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button className="table-btn delete" onClick={() => handleDelete(doc._id)}>
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
