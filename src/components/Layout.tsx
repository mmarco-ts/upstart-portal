import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const marginLeft = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="main-wrapper" style={{ marginLeft }}>
        <Outlet />
      </div>
      <ChatBot />
    </div>
  );
}
