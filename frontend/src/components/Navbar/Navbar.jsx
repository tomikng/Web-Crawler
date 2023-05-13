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
            <a href="#graph" onClick={() => handleItemClick('graph')}>Graph</a>
            <a href="#about">Link 3</a>
        </div>
    </div>
  )
}

export default Navbar