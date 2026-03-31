import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPaperclip, FiEye } from 'react-icons/fi';
import FileViewer from '../../components/FileViewer';

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/patients/records');
        setRecords(res.data.records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1>My Medical Records</h1>
        <p>View all your past consultations, lab reports, and imaging.</p>
      </div>

      <div className="dashboard-grid">
        {records.map(record => (
          <div key={record._id} className="glass-card flex flex-col">
            <div className="flex-between mb-2">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {record.type.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {new Date(record.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h3 style={{ margin: '8px 0', fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {record.title}
            </h3>
            
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <strong>Doctor:</strong> {record.doctorId?.name}
              <br/>
              <strong>Diagnosis:</strong> {record.diagnosis || 'N/A'}
            </div>

            {record.attachments?.length > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%' }}
                  onClick={() => setSelectedRecord(record)}
                >
                  <FiPaperclip /> View {record.attachments.length} Attachments
                </button>
              </div>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            No medical records found.
          </div>
        )}
      </div>

      {selectedRecord && (
        <FileViewer 
          attachments={selectedRecord.attachments} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
};

export default MyRecords;
