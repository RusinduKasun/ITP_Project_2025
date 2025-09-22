import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''}>
              Expenses
            </NavLink>
          </li>
          <li>
            <NavLink to="/income" className={({ isActive }) => isActive ? 'active' : ''}>
              Income
            </NavLink>
          </li>
          <li>
            <NavLink to="/wastage" className={({ isActive }) => isActive ? 'active' : ''}>
              Wastage
            </NavLink>
          </li>
          <li>
            <NavLink to="/breakeven" className={({ isActive }) => isActive ? 'active' : ''}>
              Break-Even
            </NavLink>
          </li>
          <li>
            <NavLink to="/profitmargin" className={({ isActive }) => isActive ? 'active' : ''}>
              Profit Margin
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;