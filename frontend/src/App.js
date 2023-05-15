import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar } from './components';
import Crawl from './components/Content/Crawl/Crawl';
import WebsiteRecords from './components/Content/WebsiteRecords/WebsiteRecords';
import CrawledPages from './components/Content/CrawledPages/CrawledPages';
import Executions from './components/Content/Executions/Executions';
import ExecutionDetails from './components/Content/Executions/ExecutionDetails';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Crawl />} />
          <Route path="/websiteRecords" element={<WebsiteRecords />} />
          <Route path="/crawledPages" element={<CrawledPages />} />
          <Route path="/executions" element={<Executions />} />
          <Route path="/executions/:id" element={<ExecutionDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
