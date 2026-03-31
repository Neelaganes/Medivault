import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiAward, FiBriefcase, FiX, FiCheck } from 'react-icons/fi';

const ManageDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', department: '', qualification: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const { data } = await api.get('/admin/diagnostics');
      setDiagnostics(data.diagnostics);
    } catch (error) {
      toast.error('Failed to load diagnostic personnel');
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
        toast.success('Diagnostic staff updated successfully');
      } else {
        await api.post('/admin/users', { ...formData, role: 'diagnostic' });
        toast.success('Diagnostic staff created successfully');
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData({ name: '', email: '', password: '', phone: '', department: '', qualification: '' });
      fetchDiagnostics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name, email: staff.email, phone: staff.phone || '',
      department: staff.department || '', qualification: staff.qualification || ''
    });
    setEditId(staff._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Staff member deleted');
      fetchDiagnostics();
    } catch (error) {
      toast.error('Failed to delete staff member');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({ name: '', email: '', password: '', phone: '', department: '', qualification: '' });
  };

  const getInitialColor = (name) => {
    const colors = ['#ea580c', '#3b82f6', '#059669', '#7c3aed', '#dc2626', '#0891b2', '#c026d3'];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Diagnostic Personnel</h1>
          <p className="admin-page-subtitle">Add, edit, or remove lab and imaging staff</p>
        </div>
        <button
          className="admin-add-btn"
          onClick={() => { showForm ? handleCancel() : setShowForm(true); }}
        >
          {showForm ? <><FiX size={16} /> Cancel</> : <><FiPlus size={16} /> Add New Staff</>}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{isEditing ? 'Edit Staff Member' : 'Create Staff Account'}</h2>
          <form onSubmit={handleSubmit} className="admin-form-grid">
            <div className="admin-form-group">
              <label>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Staff Name" />
            </div>
            <div className="admin-form-group">
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="staff@hospital.com" />
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
              <label>Department</label>
              <input type="text" name="department" required placeholder="e.g., Radiology" value={formData.department} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Qualification</label>
              <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} placeholder="e.g., B.Sc Radiology" />
            </div>
            <div className="admin-form-group full-width">
              <button type="submit" className="admin-submit-btn">
                <FiCheck size={16} />
                {isEditing ? 'Save Changes' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Diagnostics Table */}
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
        ) : diagnostics.length === 0 ? (
          <div className="admin-empty-state">
            <FiBriefcase size={48} />
            <p>No diagnostic personnel found in the system.</p>
            <button className="admin-add-btn" onClick={() => setShowForm(true)}>
              <FiPlus size={16} /> Add First Staff Member
            </button>
          </div>
        ) : (
          <>
            <div className="admin-table-header">
              <div className="col-name">Name & Role</div>
              <div className="col-spec">Specialization</div>
              <div className="col-license">Qualification</div>
              <div className="col-contact">Contact</div>
              <div className="col-actions">Actions</div>
            </div>
            {diagnostics.map(staff => (
              <div key={staff._id} className="admin-table-row">
                <div className="col-name">
                  <div className="table-avatar" style={{ background: getInitialColor(staff.name) }}>
                    {staff.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="table-name">{staff.name}</div>
                    <div className="table-role">Lab Tech</div>
                  </div>
                </div>
                <div className="col-spec">
                  <span className="info-pill purple">
                    <FiBriefcase size={13} />
                    {staff.department || '—'}
                  </span>
                </div>
                <div className="col-license">
                  <span className="info-pill green">
                    <FiAward size={13} />
                    Qual: {staff.qualification || '—'}
                  </span>
                </div>
                <div className="col-contact">
                  <span className="info-pill neutral">
                    <FiMail size={13} />
                    {staff.email}
                  </span>
                </div>
                <div className="col-actions">
                  <button className="table-btn edit" onClick={() => handleEdit(staff)}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button className="table-btn delete" onClick={() => handleDelete(staff._id)}>
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

export default ManageDiagnostics;
