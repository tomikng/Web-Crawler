import React, { useEffect, useState, useCallback } from 'react';
import './Execution.css';
import axios from 'axios';
import WebsiteRecords from "../WebsiteRecords/WebsiteRecords";
import websiteRecords from "../WebsiteRecords/WebsiteRecords";

const base_url = 'http://127.0.0.1:8000/api';
const recordsPerPage = 2;


const fetchExecutions = async (label='', sort='start_time', page=1, page_size=recordsPerPage) => {
  // if(label !== '') page = 1;
  try {
    const response = await axios.get(`${base_url}/executions/?label=${label}&sort=${sort}&page=${page}&page_size=${page_size}`);
    const data = response.data;
    return {
      count: data.count,
      results: data.results
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const fetchWebsiteRecord = async (id) => {
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
    const websiteRecord = await fetchWebsiteRecord(record.website_record);
    if (websiteRecord) {
      const { label, id } = websiteRecord;
      const id_website_record = id;
      const start_time = record.start_time
        ? new Date(record.start_time).toLocaleString()
        : 'None';
      const end_time = record.end_time
        ? new Date(record.end_time).toLocaleString()
        : 'None';
      processedRecords.push({
        id: record.id,
        id_website_record,
        label,
        status: record.status,
        start_time,
        end_time,
        num_sites_crawled: record.num_sites_crawled,
      });
    }
  }
  return processedRecords;
};

const fetchAllWebsiteRecords = async () => {
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

const Executions = () => {
  const [records, setRecords] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterLabel, setFilterLabel] = useState('');
  const [uniqueLabels, setUniqueLabels] = useState([]);
  const [sortedBy, setSortedBy] = useState('start_time');
  const [selectedValueDialog, setSelectedValueDialog] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);


  const fetchAndProcessData = useCallback(async () => {
    const fetchedData = await fetchExecutions(filterLabel, sortedBy, currentPage);
    if (fetchedData) {
      setTotalRecords(fetchedData.count);
      const processedData = await processWebsiteRecords(fetchedData.results);
      setRecords(processedData);
    }
  }, [filterLabel, sortedBy, currentPage]);

  const createNewExecution = async () => {
    const id = selectedValueDialog;
    try {
      await axios.post(`${base_url}/executions/create/${id}/`);
      setIsDialogOpen(false);
      fetchAndProcessData();
    } catch (error) {
      console.error('Error creating execution:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterLabel]);

  useEffect(() => {
    const setUniqueLabelsFromRecords = async () => {
      const allRecords = await fetchAllWebsiteRecords();
      const labels = new Set(allRecords.map(record => record.label));
      setUniqueLabels([...labels]);
    };
    setUniqueLabelsFromRecords();
  }, []);

  useEffect(() => {
    const setUniqueLabelsFromRecords = async () => {
      const allRecords = await fetchAllWebsiteRecords();
      const labels = new Set(allRecords.map(record => record.label));
      setUniqueLabels([...labels]);
    };
    setUniqueLabelsFromRecords();
  }, []);


  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData, filterLabel]);

  useEffect(() => {
    if (filterLabel) {
      const filtered = records.filter((record) => record.label === filterLabel);
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [filterLabel, records]);


  const sortIcon = (field) => {
    return sortedBy === field ? <span>&#x25BC;</span> : <span>&#x25B2;</span>;
  };

  const handleNewExecutionClick = () => {
    setIsDialogOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalRecords / recordsPerPage);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  return (
    <div>
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
              <select onChange={(e) => setSelectedValueDialog(e.target.value)}>
                <option value="none">None</option>
                {records.map((record) => (
                  <option key={record.id_website_record} value={record.id_website_record}>
                    {record.id_website_record + ' - ' + record.label}
                  </option>
                ))}
              </select>

              <button onClick={() => createNewExecution()}>Create</button>

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
              <th
                onClick={() => setSortedBy(sortedBy === 'start_time' ? '-start_time' : 'start_time')}
              >
                Start {sortIcon('start_time')}
              </th>
              <th>End</th>
              <th>Number of Crawled Pages</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
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
      <div className="pagination">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Executions;
