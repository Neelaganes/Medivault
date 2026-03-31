import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiUsers, FiFileText, FiActivity, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/doctors/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>Welcome back, here's your overview.</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.totalPatients || 0}</h3>
            <p>Patients Assigned</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>
            <FiFileText />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.totalRecords || 0}</h3>
            <p>Records Managed</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)' }}>
            <FiActivity />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.pendingDiagnostics || 0}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
      </div>

      <div className="glass-card mt-4">
        <div className="flex-between mb-4">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiClock /> Recent Records Authored
          </h2>
          <Link to="/doctor/patients" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
            View Patients
          </Link>
        </div>
        
        {data?.recentRecords?.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px 0', opacity: 0.7 }}>No records found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Patient</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentRecords?.map(record => (
                <tr key={record._id}>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{record.title}</td>
                  <td>{record.patientId?.name || 'Unknown'}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {record.type.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
