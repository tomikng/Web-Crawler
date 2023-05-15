import React from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <div>
      <div className="topnav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Crawling</Link>
        <Link to="/websiteRecords" className={location.pathname === '/websiteRecords' ? 'active' : ''}>Website Records</Link>
        <Link to="/crawledPages" className={location.pathname === '/crawledPages' ? 'active' : ''}>Crawled Pages</Link>
        <Link to="/executions" className={location.pathname === '/executions' ? 'active' : ''}>Executions</Link>
      </div>
    </div>
  );
};

export default Navbar;
