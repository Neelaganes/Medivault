import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FiSearch, FiShield, FiShieldOff } from 'react-icons/fi';

const ManageAccess = () => {
  const [grants, setGrants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGrants = async () => {
    try {
      const res = await api.get('/patients/access-grants');
      setGrants(res.data.grants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/patients/doctors/search?q=${searchQuery}`);
      setSearchResults(res.data.doctors);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const grantAccess = async (doctorId) => {
    try {
      await api.post('/patients/access-grants', { doctorId });
      toast.success('Access granted successfully');
      fetchGrants();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const revokeAccess = async (grantId) => {
    try {
      await api.put(`/patients/access-grants/${grantId}/revoke`);
      toast.success('Access revoked');
      fetchGrants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1>Manage Doctor Access</h1>
        <p>Control which doctors can view your medical records.</p>
      </div>

      <div className="glass-card mb-4" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3>Search Doctors</h3>
          <form onSubmit={handleSearch} className="form-group mt-4 flex" style={{ flexDirection: 'row' }}>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary"><FiSearch /> Search</button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searchResults.map(doc => (
                 <div key={doc._id} className="flex-between p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '12px' }}>
                   <div>
                     <div style={{ fontWeight: 500 }}>{doc.name}</div>
                     <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.specialization}</div>
                   </div>
                   <button onClick={() => grantAccess(doc._id)} className="btn btn-outline" style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>
                     <FiShield /> Grant Access
                   </button>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3>Current Access Grants</h3>
        <p style={{ margin: '8px 0 24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Doctors who currently have access to your records</p>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Granted On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grants.map(grant => (
              <tr key={grant._id}>
                <td style={{ fontWeight: 500 }}>{grant.doctorId?.name}</td>
                <td>{grant.doctorId?.specialization}</td>
                <td>
                  <span className={`badge ${grant.status === 'active' ? 'success' : 'danger'}`}>
                    {grant.status}
                  </span>
                </td>
                <td>{new Date(grant.grantedAt).toLocaleDateString()}</td>
                <td>
                  {grant.status === 'active' ? (
                    <button onClick={() => revokeAccess(grant._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--accent-red)', borderColor: 'var(--glass-border)' }}>
                      <FiShieldOff /> Revoke
                    </button>
                  ) : (
                    <button onClick={() => grantAccess(grant.doctorId._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                      Re-Grant
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {grants.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.7 }}>No access grants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAccess;
