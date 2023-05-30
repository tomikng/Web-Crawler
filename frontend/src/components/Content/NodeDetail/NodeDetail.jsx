import React, { useState } from 'react';
import './NodeDetail.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Crawl from '../Crawl/Crawl';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

/**
 * Component for displaying the details of a node in the graph.
 * If the node is a website node, it allows executing a crawl.
 */
const NodeDetail = () => {
  const location = useLocation();
  const data = location.state.data;
  const type = location.state.nodeStyle;
  const navigate = useNavigate();

  const [selectedUrl, setSelectedUrl] = useState(null);

  const formattedDate = new Date(data.crawlTime).toLocaleString();

  /**
   * Creates a new execution for the selected website record.
   * @param {number} id - The ID of the website record.
   */
  const createExecution = async (id) => {
    try {
      await axios.post(`${base_url}/executions/create/${id}/`);
      alert('Execution created successfully');
      navigate(`/crawledPages/${id}/`);
    } catch (error) {
      console.error('Error creating execution:', error);
    }
  };

  /**
   * Fetches all website records.
   * @returns {Array} Array of website records.
   */
  const fetchWebsiteRecords = async () => {
    try {
      let allWebsiteRecords = [];
      let hasMore = true;
      let page = 1;

      while (hasMore) {
        const response = await axios.get(`${base_url}/website_records/?page=${page}`);
        allWebsiteRecords = [...allWebsiteRecords, ...response.data.results];
        hasMore = response.data.next !== null;
        page += 1;
      }

      return allWebsiteRecords;
    } catch (error) {
      console.error('Error fetching all website records:', error);
      return [];
    }
  };

  /**
   * Handles the execution of a crawl for a specific URL.
   * @param {string} url - The URL to execute the crawl on.
   */
  const executeHandle = async (url) => {
    const websiteRecords = await fetchWebsiteRecords();

    const existsInArray = websiteRecords.some(function (item) {
      return item.url === url;
    });

    if (existsInArray) {
      createExecution(data.owner.identifier);
    } else {
      setSelectedUrl(url);
    }
  };

  if (selectedUrl) {
    return <Crawl initialUrl={selectedUrl} />;
  }

  if (type === 'customNode') {
    return <Crawl initialUrl={data.url} />;
  } else {
    return (
      <div id="node-details-container">
        <button className="new-execution-button" onClick={() => createExecution(data.owner.identifier)}>
          Execute
        </button>
        <h1 className="node-detail-title">Node Detail</h1>
        <h2>URL:</h2>
        <p className="node-detail-url">{data.url}</p>
        <h2>Crawl time:</h2>
        <p className="node-detail-time">{formattedDate}</p>
        <h2>Links:</h2>
        <table id="links-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.links &&
              data.links.map((link, index) => (
                <tr key={index}>
                  <td>{link.url}</td>
                  <td>{link.title}</td>
                  <td>
                    <button onClick={() => executeHandle(link.url)}>Execute</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default NodeDetail;
