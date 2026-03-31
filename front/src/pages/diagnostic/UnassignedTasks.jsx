import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UnassignedTasks = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await api.get('/diagnostic/requests/unassigned');
      setRequests(res.data.requests);
    } catch (err) {
      toast.error('Failed to load global task pool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await api.put(`/diagnostic/requests/${reqId}/accept`);
      toast.success('Task accepted successfully!');
      navigate('/diagnostic/requests');
    } catch (err) {
      toast.error('Failed to accept task');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1>Global Task Pool</h1>
        <p>Unassigned diagnostic requests from across the hospital. Claim a task to begin work.</p>
      </div>

      <div className="dashboard-grid">
        {requests.map(req => (
          <div key={req._id} className="glass-card flex flex-col">
            <div className="flex-between mb-2">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {req.testType.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`badge ${req.priority === 'urgent' || req.priority === 'high' ? 'danger' : ''}`} style={{ background: req.priority === 'low' || req.priority === 'medium' ? 'rgba(255,255,255,0.1)' : '' }}>
                {req.priority.toUpperCase()}
              </span>
            </div>
            
            <h3 style={{ margin: '8px 0 4px', fontSize: '1.25rem' }}>{req.title}</h3>
            
            <div style={{ fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}><strong>Patient:</strong> {req.patientId?.name}</div>
              <div style={{ marginBottom: '8px' }}><strong>Requested By:</strong> {req.doctorId?.name}</div>
              <div style={{ marginBottom: '8px' }}><strong>Created:</strong> {new Date(req.createdAt).toLocaleString()}</div>
              {req.description && <div style={{ opacity: 0.8 }}><i>"{req.description}"</i></div>}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button onClick={() => handleAccept(req._id)} className="btn btn-primary" style={{ width: '100%' }}>
                Claim Task
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
             <p>No unassigned tasks currently available in the pool.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnassignedTasks;
