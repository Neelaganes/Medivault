import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdLocalHospital } from 'react-icons/md';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...formData, role: 'patient' });
      toast.success('Registration successful!');
      navigate(`/patient/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '40px 24px' }}>
      <div className="auth-card glass-panel" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="sidebar-logo justify-center mb-4">
            <div className="sidebar-logo-icon" style={{ background: 'var(--accent-green)' }}>
              <MdLocalHospital size={24} color="#fff" />
            </div>
            <div>
              <div className="sidebar-logo-title">MediVault</div>
            </div>
          </div>
          <h2>Patient Registration</h2>
          <p>Create a portal account to view your medical records</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dashboard-grid" style={{ gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="Min 6 characters" style={{ paddingRight: '44px' }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="1234567890" />
            </div>
          </div>

          <div className="form-group mt-4">
            <button type="submit" className="btn btn-success" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
          
          <div className="mt-4" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-green)', textDecoration: 'none' }}>Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
