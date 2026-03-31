import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiList, FiCheckCircle, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DiagnosticDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/diagnostic/dashboard');
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
          <h1>Diagnostic Dashboard</h1>
          <p>Welcome back, here's your task overview.</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
            <FiList />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.pendingRequests || 0}</h3>
            <p>Active Tasks</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.completedRequests || 0}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)' }}>
            <FiActivity />
          </div>
          <div className="stat-info">
            <h3>{data?.stats?.unassignedRequests || 0}</h3>
            <p>Pooled Requests</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div className="flex-between mb-4">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiList /> Recent Assignments
            </h2>
            <Link to="/diagnostic/requests" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
              View All Tasks
            </Link>
          </div>
          
          {data?.recentRequests?.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 0', opacity: 0.7 }}>No tasks assigned yet.</p>
          ) : (
             <table className="data-table">
               <thead>
                 <tr>
                   <th>Date</th>
                   <th>Test Type</th>
                   <th>Patient</th>
                   <th>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {data?.recentRequests?.map(req => (
                   <tr key={req._id}>
                     <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                     <td style={{ fontWeight: 500 }}>{req.title}</td>
                     <td>{req.patientId?.name || 'Unknown'}</td>
                     <td>
                       <span className={`badge ${req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'warning' : ''}`} style={{ background: req.status === 'pending' ? 'rgba(255,255,255,0.1)' : '' }}>
                         {req.status.replace('_', ' ')}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>

        <div className="glass-card flex flex-col justify-center align-center" style={{ textAlign: 'center' }}>
          <FiActivity size={48} color="var(--accent-purple)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3>Find More Work</h3>
          <p style={{ margin: '8px 0 24px' }}>There are currently <strong>{data?.stats?.unassignedRequests || 0}</strong> unassigned requests in the global hospital pool.</p>
          <Link to="/diagnostic/unassigned" className="btn btn-primary" style={{ width: '100%' }}>
            Browse Pool <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticDashboard;
