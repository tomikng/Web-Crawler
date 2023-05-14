import React, { useState } from 'react';
import './App.css';
import { Navbar } from './components';
import Crawl from './components/Content/Crawl/Crawl';
import Graph from './components/Content/Graph/Graph';
import Records from './components/Content/Records/Records';

function App() {
  const [activeContent, setActiveContent] = useState(null);

  const handleNavbarItemClick = (content) => {
    setActiveContent(content);
  };
  return (
    <div className="App">
      <Navbar onItemClick={handleNavbarItemClick}/>
      {activeContent === 'crawl' && <Crawl />}
      {activeContent === 'graph' && <Graph />}
      {activeContent === 'records' && <Records />}
    </div>
  );
}

export default App;
