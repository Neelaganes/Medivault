import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiUsers, FiActivity, FiClipboard } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalDiagnostics: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Admin Control Panel</h1>
          <p className="admin-page-subtitle">System overview and staff management</p>
        </div>
        <div className="admin-stats-row">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-stat-card skeleton-card">
              <div className="skeleton-icon"></div>
              <div className="skeleton-lines">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Registered Patients',
      value: stats.totalPatients,
      sub: 'Total platform users',
      icon: <FiUsers size={22} />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)'
    },
    {
      label: 'Doctors',
      value: stats.totalDoctors,
      sub: 'Active consulting physicians',
      icon: <FiClipboard size={22} />,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)'
    },
    {
      label: 'Diagnostic Staff',
      value: stats.totalDiagnostics,
      sub: 'Active lab/imaging personnel',
      icon: <FiActivity size={22} />,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)'
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Admin Control Panel</h1>
        <p className="admin-page-subtitle">System overview and staff management</p>
      </div>

      <div className="admin-stats-row">
        {statCards.map((card, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-quick-actions">
        <h2 className="admin-section-heading">Quick Actions</h2>
        <div className="admin-actions-row">
          <Link to="/admin/doctors" className="admin-action-card">
            <div className="admin-action-icon" style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
              <FiUsers size={20} />
            </div>
            <div>
              <div className="admin-action-title">Manage Doctors</div>
              <div className="admin-action-desc">Add, edit, or remove physicians</div>
            </div>
          </Link>
          <Link to="/admin/diagnostics" className="admin-action-card">
            <div className="admin-action-icon" style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed' }}>
              <FiActivity size={20} />
            </div>
            <div>
              <div className="admin-action-title">Manage Diagnostics</div>
              <div className="admin-action-desc">Add, edit, or remove lab staff</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
