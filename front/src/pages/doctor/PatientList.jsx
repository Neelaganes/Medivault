import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FiUser, FiActivity, FiFolder } from 'react-icons/fi';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/doctors/patients');
        setPatients(res.data.patients);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>My Patients</h1>
          <p>Patients who have granted you access to their records.</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '250px', padding: '10px 16px' }}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        {filteredPatients.map((patient) => (
          <div key={patient._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  border: '1px solid var(--glass-border)'
                }}
              >
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{patient.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{patient.email}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', flex: 1 }}>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <span style={{ width: '100px', fontWeight: 500 }}>Phone:</span> {patient.phone || 'N/A'}
              </div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <span style={{ width: '100px', fontWeight: 500 }}>Gender:</span> {patient.gender || 'N/A'}
              </div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <span style={{ width: '100px', fontWeight: 500 }}>Blood Group:</span> {patient.bloodGroup || 'N/A'}
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', fontWeight: 500 }}>DOB:</span>{' '}
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <Link to={`/doctor/patients/${patient._id}/records`} className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>
                <FiFolder /> Records
              </Link>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', opacity: 0.7 }}>
            No patients found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
