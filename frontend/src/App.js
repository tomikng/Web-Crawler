import React, { useState } from 'react';
import './App.css';
import { Navbar } from './components';
import Crawl from './components/Content/Crawl/Crawl';
import WebsiteRecords from './components/Content/WebsiteRecords/WebsiteRecords';
import CrawledPages from './components/Content/CrawledPages/CrawledPages';
import Executions from "./components/Content/Executions/Executions";

function App() {
  const [activeContent, setActiveContent] = useState(null);

  const handleNavbarItemClick = (content) => {
    setActiveContent(content);
  };
  return (
    <div className="App">
      <Navbar onItemClick={handleNavbarItemClick}/>
      {activeContent === 'crawl' && <Crawl />}
      {activeContent === 'websiteRecords' && <WebsiteRecords />}
      {activeContent === 'crawledPages' && <CrawledPages />}
      {activeContent === 'executions' && <Executions />}
    </div>
  );
}

export default App;
