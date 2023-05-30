import React from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';


/**
 * Component for rendering the navigation bar.
 * @returns {JSX.Element} The rendered Navbar component.
 */
const Navbar = () => {
  const location = useLocation();

  return (
    <div>
      <div className="topnav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Crawling</Link>
        <Link to="/websiteRecords" className={location.pathname === '/websiteRecords' ? 'active' : ''}>Website Records</Link>
        <Link to="/selectWebsite" className={location.pathname === '/selectWebsite' ? 'active' : ''}>Crawled Pages</Link>
        <Link to="/executions" className={location.pathname === '/executions' ? 'active' : ''}>Executions</Link>
      </div>
    </div>
  );
};

export default Navbar;
