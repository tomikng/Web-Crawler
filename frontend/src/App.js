import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar } from './components';
import Crawl from './components/Content/Crawl/Crawl';
import WebsiteRecords from './components/Content/WebsiteRecords/WebsiteRecords';
import CrawledPages from './components/Content/CrawledPages/CrawledPages';
import Executions from './components/Content/Executions/Executions';
import ExecutionDetails from './components/Content/Executions/ExecutionDetails';
import WebsiteRecordsDetail from './components/Content/WebsiteRecords/WebsiteRecordsDetail';
import SelectWebsite from "./components/Content/CrawledPages/SelectWebsite";
import NodeDetail from './components/Content/NodeDetail/NodeDetail';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Crawl />} />
          <Route path="/websiteRecords" element={<WebsiteRecords />} />
          <Route path="/website_records/:id" element={<WebsiteRecordsDetail />} />
          <Route path="/selectWebsite" element={<SelectWebsite />} />
          <Route path="/crawledPages/:website" element={<CrawledPages />} />
          <Route path="/executions" element={<Executions />} />
          <Route path="/executions/:id" element={<ExecutionDetails />} />
          <Route path="/nodeDetail/:id" element={<NodeDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
