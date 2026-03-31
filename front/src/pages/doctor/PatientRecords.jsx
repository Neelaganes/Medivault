import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiPlus, FiArrowLeft, FiPaperclip } from 'react-icons/fi';
import FileViewer from '../../components/FileViewer';

const PatientRecords = () => {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', diagnosis: '', prescription: '', type: 'consultation'
  });

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/doctors/patients/${patientId}/records`);
      setRecords(res.data.records);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/doctors/records`, { ...formData, patientId });
      toast.success('Record created successfully');
      setShowForm(false);
      setFormData({ title: '', description: '', diagnosis: '', prescription: '', type: 'consultation' });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <div style={{ marginBottom: '8px' }}>
            <Link to="/doctor/patients" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiArrowLeft /> Back to Patients
            </Link>
          </div>
          <h1>Patient Records</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <FiPlus /> New Record
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-4" style={{ border: '1px solid var(--accent-blue)' }}>
          <h3 className="mb-4">Create New Medical Record</h3>
          <form onSubmit={handleSubmit} className="dashboard-grid" style={{ gap: '16px', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Title <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input 
                required type="text" value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="E.g., Initial Consultation - Headache"
              />
            </div>
            
            <div className="form-group">
              <label>Record Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="consultation">Consultation</option>
                <option value="prescription">Prescription</option>
                <option value="surgery">Surgery Note</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Diagnosis</label>
              <input type="text" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="E.g., Migraine" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description (Symptoms, Notes)</label>
              <textarea 
                rows={3} value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Patient presented with severe throbbing head pain..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Prescription / Treatment</label>
              <textarea 
                rows={2} value={formData.prescription} 
                onChange={e => setFormData({ ...formData, prescription: e.target.value })} 
                placeholder="Ibuprofen 400mg twice a day for 3 days..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        {records.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px 0', opacity: 0.7 }}>No medical records exist for this patient.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {records.map(record => (
              <div key={record._id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div className="flex-between mb-2">
                  <h3 style={{ margin: 0 }}>{record.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{record.type.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.9375rem', marginTop: '12px', display: 'grid', gridTemplateColumns: 'minmax(200px, auto) 1fr', gap: '12px 24px' }}>
                  {record.diagnosis && (
                    <>
                      <div style={{ color: 'var(--text-muted)' }}>Diagnosis:</div>
                      <div>{record.diagnosis}</div>
                    </>
                  )}
                  {record.description && (
                     <>
                     <div style={{ color: 'var(--text-muted)' }}>Notes:</div>
                     <div style={{ whiteSpace: 'pre-wrap' }}>{record.description}</div>
                   </>
                  )}
                  {record.prescription && (
                    <>
                      <div style={{ color: 'var(--text-muted)' }}>Prescription:</div>
                      <div style={{ color: 'var(--accent-green)' }}>{record.prescription}</div>
                    </>
                  )}
                  <div style={{ color: 'var(--text-muted)' }}>Authored By:</div>
                  <div style={{ fontStyle: 'italic', opacity: 0.8 }}>{record.doctorId?.name}</div>
                </div>

                {record.attachments?.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px dashed var(--glass-border)' }}>
                    <button onClick={() => setSelectedRecord(record)} className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.875rem' }}>
                      <FiPaperclip /> View {record.attachments.length} Attachments
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <FileViewer attachments={selectedRecord.attachments} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default PatientRecords;
