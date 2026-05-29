import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Sparkles, FolderOpen, ChevronLeft, Search } from 'lucide-react';
import { useCurrentUser } from '../lib/useCurrentUser';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, loading } = useCurrentUser();
  const displayName = user?.displayName || (loading ? 'Loading…' : 'Guest');
  const userRole = user?.userName ? `@${user.userName}` : 'Capital Partner Portal';
  const initials = user?.initials || (loading ? '…' : 'G');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg className="sidebar-logo-mark" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 12 L54 32 L46 32 L46 52 L38 52 L38 38 L26 38 L26 52 L18 52 L18 32 L10 32 Z" fill="#04a888"/>
            <path d="M32 20 L46 34 L42 34 L42 46 L38 46 L38 34 L26 34 L26 46 L22 46 L22 34 L18 34 Z" fill="#003a36" opacity="0.32"/>
          </svg>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">upstart</span>
            <span className="sidebar-logo-subtitle">Capital Partner</span>
          </div>
        </div>
      </div>

      <button
        className="sidebar-toggle-edge"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft size={14} />
      </button>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Home size={20} /></span>
            <span className="nav-item-text">Home</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Portfolio Analytics</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><LayoutDashboard size={20} /></span>
            <span className="nav-item-text">Lending Performance</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Search size={20} /></span>
            <span className="nav-item-text">Search</span>
          </NavLink>
          <NavLink to="/ai-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Sparkles size={20} /></span>
            <span className="nav-item-text">Insights AI</span>
          </NavLink>
          <NavLink to="/my-reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><FolderOpen size={20} /></span>
            <span className="nav-item-text">My Reports</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" title={`${displayName} ${userRole}`}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
