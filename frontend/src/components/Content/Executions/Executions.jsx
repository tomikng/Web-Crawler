import React, { useEffect, useState, useCallback } from 'react';
import './Execution.css';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';
const recordsPerPage = 5;

/**
 * Fetches executions from the API.
 * @param {string} label - The label to filter the executions by.
 * @param {string} sort - The field to sort the executions by.
 * @param {number} page - The page number.
 * @param {number} page_size - The number of records per page.
 * @returns {Promise<{ count: number, results: any[] }>} The fetched executions.
 */
const fetchExecutions = async (label='', sort='start_time', page=1, page_size=recordsPerPage) => {
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

/**
 * Fetches a website record from the API.
 * @param {number} id - The ID of the website record.
 * @returns {Promise<any>} The fetched website record.
 */
const fetchWebsiteRecord = async (id) => {
  try {
    const response = await axios.get(`${base_url}/website_records/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching website records:', error);
    return null;
  }
};

/**
 * Processes the website records associated with the executions.
 * @param {any[]} records - The execution records.
 * @returns {Promise<any[]>} The processed execution records.
 */
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

/**
 * Fetches all website records from the API.
 * @returns {Promise<any[]>} The fetched website records.
 */
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

/**
 * Component for displaying and managing executions.
 */
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
  const [websiteRecords, setWebsiteRecords] = useState({});

  /**
   * Fetches and processes the execution data.
   */
  const fetchAndProcessData = useCallback(async () => {
    const fetchedData = await fetchExecutions(filterLabel, sortedBy, currentPage);
    if (fetchedData) {
      setTotalRecords(fetchedData.count);
      const processedData = await processWebsiteRecords(fetchedData.results);
      setRecords(processedData);
    }
  }, [filterLabel, sortedBy, currentPage]);

  /**
   * Creates a new execution.
   */
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
      const data = allRecords.map(record => ({id: record.id, label: record.label}))
      setWebsiteRecords(data);
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


  /**
   * Renders the sort icon based on the sortedBy field.
   * @param {string} field - The field to be sorted.
   * @returns {JSX.Element} The sort icon.
   */
  const sortIcon = (field) => {
    return sortedBy === field ? <span>&#x25BC;</span> : <span>&#x25B2;</span>;
  };

  /**
   * Handles the click event for creating a new execution.
   */
  const handleNewExecutionClick = () => {
    setIsDialogOpen(true);
  };

    // Calculate pagination values
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

  /**
   * Handles the page change event.
   * @param {number} page - The new page number.
   */
  const handlePageChange = (page) => {

    if(currentPage <= totalPages){
        setCurrentPage(page);
    }

    // setCurrentPage(page);
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
                {websiteRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.id + ' - ' + record.label}
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
