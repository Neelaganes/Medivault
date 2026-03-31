import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Access denied. Administrator privileges required.');
        // Log them back out if they aren't admin but somehow logged in here
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ borderTop: '4px solid var(--accent-orange)' }}>
        <div className="auth-header">
          <div className="sidebar-logo justify-center mb-4">
            <div className="sidebar-logo-icon" style={{ background: 'var(--accent-orange)' }}>
              <MdAdminPanelSettings size={28} color="#fff" />
            </div>
            <div>
              <div className="sidebar-logo-title">Admin Portal</div>
            </div>
          </div>
          <h2>System Administration</h2>
          <p>Sign in to manage hospital staff</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="admin@medivault.com" 
            />
          </div>

          <div className="form-group">
            <label>Master Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                style={{ paddingRight: '44px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', background: 'var(--accent-orange)' }}>
              {loading ? 'Authenticating...' : 'Access Admin Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
