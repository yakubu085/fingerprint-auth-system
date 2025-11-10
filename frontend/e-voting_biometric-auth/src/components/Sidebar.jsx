// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isAdmin, collapsed, toggleCollapse }) => {
  const linkClasses = ({ isActive }) => `nav-link d-flex align-items-center mb-2 p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-white'} hover-effect`;

  return (
    <div className={`d-flex flex-column p-3 text-white sidebar ${collapsed ? 'collapsed' : ''}`} style={{ backgroundColor: '#1A3D7C', minHeight: '100vh', transition: 'width 0.3s' }}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <span className="fs-4 fw-bold">SUG eVote</span>
        <button className="btn btn-sm btn-light d-md-none" onClick={toggleCollapse}>
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      <nav className="flex-column">
        <NavLink to="/dashboard" className={linkClasses}>🏠 Dashboard</NavLink>
        <NavLink to="/dashboard/elections" className={linkClasses}>🗳️ Elections</NavLink>
        <NavLink to="/dashboard/news" className={linkClasses}>📢 News</NavLink>
        {isAdmin && (
          <>
            <NavLink to="/dashboard/add-election" className={linkClasses}>➕ Add Election</NavLink>
            <NavLink to="/dashboard/add-candidate" className={linkClasses}>➕ Add Candidate</NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
