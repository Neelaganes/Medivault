import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiFileText, FiUsers,
  FiLogOut, FiActivity, FiShield, FiList,
  FiMenu, FiX
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { useState, useEffect } from 'react';

const navConfig = {
  patient: [
    { to: '/patient/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/patient/records', icon: <FiFileText />, label: 'My Records' },
    { to: '/patient/access', icon: <FiShield />, label: 'Manage Access' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/doctor/patients', icon: <FiUsers />, label: 'My Patients' },
    { to: '/doctor/diagnostics', icon: <FiActivity />, label: 'Diagnostic Requests' },
  ],
  diagnostic: [
    { to: '/diagnostic/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/diagnostic/requests', icon: <FiList />, label: 'My Requests' },
    { to: '/diagnostic/unassigned', icon: <FiActivity />, label: 'Unassigned Tasks' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/doctors', icon: <FiUsers />, label: 'Manage Doctors' },
    { to: '/admin/diagnostics', icon: <FiActivity />, label: 'Manage Diagnostics' },
  ],
};

const roleColors = {
  patient: 'var(--accent-green)',
  doctor:  'var(--accent-blue)',
  diagnostic: 'var(--accent-purple)',
  admin: 'var(--accent-orange)'
};

const roleLabels = {
  patient: 'Patient',
  doctor: 'Doctor',
  diagnostic: 'Diagnostic',
  admin: 'Administrator'
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navConfig[user?.role] || [];
  const accentColor = roleColors[user?.role] || 'var(--accent-blue)';

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile header actions */}
      <div className="mobile-header-actions">
        <button
          className="mobile-logout-action"
          onClick={handleLogout}
          aria-label="Sign Out"
          title="Sign Out"
        >
          <FiLogOut size={20} />
        </button>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Mobile close button */}
        <button
          className="mobile-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <FiX size={20} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: accentColor }}>
            <MdLocalHospital size={22} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-title">MediVault</div>
            <div className="sidebar-logo-sub">Hospital System</div>
          </div>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: accentColor }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role" style={{ color: accentColor }}>
              {roleLabels[user?.role]}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">NAVIGATION</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? {
                background: accentColor,
                color: '#ffffff',
                borderColor: accentColor
              } : {}}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={16} />
          Sign Out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
