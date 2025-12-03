import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Book, Users, Skull, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { userRole, setUserRole } = useApp();
  const [showRoles, setShowRoles] = useState(false);

  const setRole = (role) => {
    setUserRole(role);
    setShowRoles(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/assets/logo.jpg" alt="Doskvol" className="navbar-logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Book size={20} />
            <span>Journal</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/crew" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>The Crew</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/characters" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Skull size={20} />
            <span>Characters</span>
          </NavLink>
        </li>
      </ul>
      <div className="navbar-footer">
        <div className="role-switcher">
          <button className="btn-icon" onClick={() => setShowRoles(!showRoles)} title="Switch Role">
            <Settings size={20} />
          </button>
          {showRoles && (
            <div className="role-menu panel">
              <button onClick={() => setRole('GM')} className={userRole === 'GM' ? 'active' : ''}>GM</button>
              <button onClick={() => setRole('char_1')} className={userRole === 'char_1' ? 'active' : ''}>Player (Silas)</button>
              <button onClick={() => setRole('char_2')} className={userRole === 'char_2' ? 'active' : ''}>Player (Nyx)</button>
            </div>
          )}
        </div>
        <div className="current-role">
          <small>Role: {userRole === 'GM' ? 'GM' : userRole === 'char_1' ? 'Silas' : 'Nyx'}</small>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
