import React, { useEffect, useState, useCallback } from 'react';

import './Execution.css';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

const fetchExecutions = async () => {
  try {
    const response = await axios.get(`${base_url}/executions/`);
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const fetchWebsiteRecords = async (id) => {
  try {
    const response = await axios.get(`${base_url}/website_records/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching website records:', error);
    return null;
  }
};

const processWebsiteRecords = async (records) => {
  const processedRecords = [];
  for (const record of records) {
    const websiteRecord = await fetchWebsiteRecords(record.website_record);
    if (websiteRecord) {
      const { label } = websiteRecord;
      processedRecords.push({
        id: record.id,
        label,
        status: record.status,
        start_time: new Date(record.start_time).toLocaleString(),
        end_time: new Date(record.end_time).toLocaleString(),
        num_sites_crawled: record.num_sites_crawled,
      });
    }
  }
  return processedRecords;
};


const Executions = () => {
  const [records, setRecords] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterLabel, setFilterLabel] = useState('');
  const [uniqueLabels, setUniqueLabels] = useState([]);


  const filterRecords = useCallback(() => {
    if (filterLabel) {
      const filtered = records.filter((record) => record.label === filterLabel);
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [filterLabel, records]);



  useEffect(() => {
    const fetchData = async () => {
      const executionData = await fetchExecutions();
      if (executionData) {
        const processedData = await processWebsiteRecords(executionData);
        setRecords(processedData);

        // extract unique labels
        const labels = [...new Set(processedData.map(record => record.label))];
        setUniqueLabels(labels);
      }
    };

    fetchData();
  }, []);

  const handleNewExecutionClick = () => {
    setIsDialogOpen(true); // Open the dialog box
  };

  useEffect(() => {
    filterRecords();
  }, [records, filterLabel, filterRecords]);


  return (
    <div className="executions-container">
      <button className="new-execution-button" onClick={handleNewExecutionClick}>
        New Execution
      </button>
      <div className="filter-container">
        <label htmlFor="filter">Filter by Label:</label>
        <select
          id="filter"
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value)}
        >
          <option value="">All</option>
          {uniqueLabels.map((label, index) => (
            <option key={index} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {isDialogOpen && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>Create New Execution</h3>
            {/* Add your form or additional content here */}
            <button onClick={() => setIsDialogOpen(false)}>Close</button>
          </div>
        </div>
      )}
      <table className="executions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Execution Status</th>
            <th>Start</th>
            <th>End</th>
            <th>Number of Crawled Pages</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>
                <a href={`/executions/${record.id}`}>{record.label}</a>
              </td>
              <td>{record.status}</td>
              <td>{record.start_time}</td>
              <td>{record.end_time}</td>
              <td>{record.num_sites_crawled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Executions;
