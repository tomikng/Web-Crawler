import React from 'react';
import './Navbar.css';

const Navbar = ({ onItemClick }) => {

    const handleItemClick = (content) => {
        onItemClick(content);
    };

  return (
    <div>
        <div className="topnav">
            <a className="active" href="#home">Home</a>
            <a href="#crawl" onClick={() => handleItemClick('crawl')}>Crawling</a>
            <a href="#websiteRecords" onClick={() => handleItemClick('websiteRecords')}>Websites Records</a>
            <a href="#crawledPages" onClick={() => handleItemClick('crawledPages')}>Crawled Pages</a>  {/* By melo rozkliknout na tabulku nebo na graf */}
            
            <a href="#executions" onClick={() => handleItemClick('executions')}>Link 3</a>
        </div>
    </div>
  )
}

export default Navbar