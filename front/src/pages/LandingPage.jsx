import { Link } from 'react-router-dom';
import { MdLocalHospital, MdSecurity, MdPeople, MdFolderShared } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-icon">
            <MdLocalHospital size={24} color="#fff" />
          </div>
          <span className="logo-text">MediVault</span>
        </div>
        <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="icon-btn outline-icon-btn" title="Settings">
            <FiSettings size={18} />
          </button>
          <a href="#" className="nav-text-link">Support</a>
          <Link to="/admin/login" className="btn btn-outline-dark">Staff Portal</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content text-center">
          <div className="hero-badge">Next-Generation Hospital Management</div>
          <h1 className="hero-title serif-heading">Secure Medical Records,<br/>Simplified.</h1>
          <p className="hero-subtitle">
            Experience the future of healthcare administration. MediVault connects patients, doctors, and diagnostic centers through a unified, secure cloud platform.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-large shadow-lg">Register as Patient</Link>
            <Link to="/login" className="btn-text-link">Access Records</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title text-center">Enterprise-Grade Features</h2>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon" style={{ background: 'var(--accent-blue)' }}>
              <MdSecurity size={28} color="#fff" />
            </div>
            <h3>Bank-Level Security</h3>
            <p>Your medical data is encrypted and stored securely. You have absolute control over which doctors can view your history.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon" style={{ background: 'var(--accent-green)' }}>
              <MdPeople size={28} color="#fff" />
            </div>
            <h3>Seamless Collaboration</h3>
            <p>Doctors can instantly request diagnostic tests. Lab technicians can directly upload X-rays and reports to your profile.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon" style={{ background: 'var(--accent-purple)' }}>
              <MdFolderShared size={28} color="#fff" />
            </div>
            <h3>Cloud Integration</h3>
            <p>Medical imagery and lab reports are powered by cutting-edge cloud storage, ensuring they are never lost and always accessible.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="workflow-section">
        <div className="glass-panel workflow-container">
          <h2 className="section-title text-center">How MediVault Works</h2>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <h4>Register</h4>
              <p>Create your secure patient account in under 2 minutes.</p>
            </div>
            <div className="step-connector"></div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <h4>Grant Access</h4>
              <p>Search for your consulting doctor and grant them temporary access.</p>
            </div>
            <div className="step-connector"></div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <h4>Get Treated</h4>
              <p>Doctors prescribe medication and order cloud-backed diagnostics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="logo-icon">
            <MdLocalHospital size={20} color="#fff" />
          </div>
          <span className="logo-text">MediVault</span>
        </div>
        <p className="copyright">© 2026 MediVault Hospital Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
