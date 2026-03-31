import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showModal, setShowModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/diagnostic/requests');
      setRequests(res.data.requests);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (reqId) => {
    try {
      await api.put(`/diagnostic/requests/${reqId}/accept`);
      toast.success('Task started!');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const openUploadModal = (req) => {
    setActiveRequest(req);
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.warn('Please select at least one file.');

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.post(`/diagnostic/requests/${activeRequest._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Files uploaded & task completed successfully!');
      setShowModal(false);
      setFiles([]);
      setActiveRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1>My Assigned Tasks</h1>
        <p>Manage diagnostic tasks assigned directly to you or picked up from the pool.</p>
      </div>

      <div className="dashboard-grid">
        {requests.map(req => (
          <div key={req._id} className="glass-card flex flex-col" style={{ borderLeft: `4px solid ${req.status === 'completed' ? 'var(--accent-green)' : req.status === 'in_progress' ? '#fbbf24' : 'var(--text-muted)'}` }}>
            <div className="flex-between mb-2">
              <span className={`badge ${req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'warning' : ''}`} style={{ background: req.status === 'pending' ? 'rgba(255,255,255,0.1)' : '' }}>
                {req.status.replace('_', ' ')}
              </span>
              <span className={`badge ${req.priority === 'urgent' || req.priority === 'high' ? 'danger' : ''}`} style={{ background: req.priority === 'low' || req.priority === 'medium' ? 'rgba(255,255,255,0.1)' : '' }}>
                {req.priority.toUpperCase()}
              </span>
            </div>
            
            <h3 style={{ margin: '8px 0 4px', fontSize: '1.25rem' }}>{req.title}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>{req.testType.replace('_', ' ').toUpperCase()}</div>
            
            <div style={{ fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}><strong>Patient:</strong> {req.patientId?.name} ({req.patientId?.phone || 'No phone'})</div>
              <div style={{ marginBottom: '8px' }}><strong>Requested By:</strong> {req.doctorId?.name}</div>
              {req.description && <div><strong>Notes:</strong> {req.description}</div>}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              {req.status === 'pending' && (
                <button onClick={() => handleStatusChange(req._id)} className="btn btn-primary" style={{ flex: 1 }}>
                  Start Task
                </button>
              )}
              {req.status === 'in_progress' && (
                <button onClick={() => openUploadModal(req)} className="btn btn-success" style={{ flex: 1 }}>
                  <FiUploadCloud /> Upload Results
                </button>
              )}
              {req.status === 'completed' && (
                <button disabled className="btn btn-outline" style={{ flex: 1, opacity: 0.5 }}>
                  <FiCheckCircle /> Completed
                </button>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            You have no assigned tasks.
          </div>
        )}
      </div>

      {showModal && (
        <div className="file-viewer-overlay" onClick={() => !uploading && setShowModal(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', background: 'var(--bg-dark)' }} onClick={e => e.stopPropagation()}>
            <h3 className="mb-4">Upload Results for {activeRequest?.patientId?.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
              Test: {activeRequest?.title} ({activeRequest?.testType.replace('_', ' ').toUpperCase()})
            </p>

            <form onSubmit={handleFileUpload}>
              <div className="form-group mb-4">
                <label>Select Files (Images, PDFs)</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setFiles(e.target.files)} 
                  disabled={uploading}
                  accept="image/*,application/pdf"
                  style={{ padding: '24px 16px', border: '1px dashed var(--glass-border)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max file size: 50MB</span>
              </div>

              <div className="flex" style={{ gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={uploading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={uploading || files.length === 0}>
                  {uploading ? 'Uploading...' : 'Upload & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
