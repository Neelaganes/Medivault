import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const CreateDiagnosticRequest = () => {
  const [patients, setPatients] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', patientId: '', diagnosticPersonId: '', testType: 'xray', priority: 'medium'
  });

  const fetchData = async () => {
    try {
      const [patientsRes, personnelRes, requestsRes] = await Promise.all([
        api.get('/doctors/patients'),
        api.get('/doctors/diagnostic-personnel'),
        api.get('/doctors/diagnostic-requests')
      ]);
      setPatients(patientsRes.data.patients);
      setPersonnel(personnelRes.data.personnel);
      setRequests(requestsRes.data.requests);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors/diagnostic-requests', {
         ...formData,
         diagnosticPersonId: formData.diagnosticPersonId === '' ? undefined : formData.diagnosticPersonId
      });
      toast.success('Request sent successfully');
      setFormData({ title: '', description: '', patientId: '', diagnosticPersonId: '', testType: 'xray', priority: 'medium' });
      fetchData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1>Diagnostic Requests</h1>
        <p>Assign tasks to diagnostic personnel or queue unassigned requests.</p>
      </div>

      <div className="glass-card mb-4" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <h3 className="mb-4">Create New Request</h3>
          <form onSubmit={handleSubmit} className="dashboard-grid" style={{ gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Patient <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <select required value={formData.patientId} onChange={e => setFormData({ ...formData, patientId: e.target.value })}>
                <option value="" disabled>Select a patient...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Title / Test Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="E.g., Chest X-Ray (AP/Lateral)" />
            </div>

            <div className="form-group">
              <label>Test Type</label>
              <select value={formData.testType} onChange={e => setFormData({ ...formData, testType: e.target.value })}>
                <option value="xray">X-Ray</option>
                <option value="mri">MRI</option>
                <option value="ct_scan">CT Scan</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="blood_test">Blood Test</option>
                <option value="urine_test">Urine Test</option>
                <option value="ecg">ECG</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Assign To (Optional)</label>
              <select value={formData.diagnosticPersonId} onChange={e => setFormData({ ...formData, diagnosticPersonId: e.target.value })}>
                <option value="">-- Leave Unassigned (Any available tech can pick it up) --</option>
                {personnel.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - {p.department} ({p.phone})</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>If unassigned, it will appear in the global task pool.</span>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Reason / Clinical Notes</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Assess for pneumonia..." />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Diagnostic Request</button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="mb-4">My Placed Requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>{req.patientId?.name}</td>
                <td style={{ textTransform: 'uppercase' }}>{req.testType.replace('_', ' ')}</td>
                <td>
                  <span className={`badge ${req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'warning' : ''}`} style={{ background: req.status === 'pending' ? 'rgba(255,255,255,0.1)' : '' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{req.diagnosticPersonId?.name || <i style={{ opacity: 0.5 }}>Unassigned</i>}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.7 }}>No requests have been made yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateDiagnosticRequest;
