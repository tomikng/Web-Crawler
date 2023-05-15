import React, { useEffect, useState } from 'react';
import './Execution.css';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

const fetchExecutions = async (page) => {
  try {
    const response = await axios.get(`${base_url}/executions/?page=${page}`);
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
        start_time: record.start_time,
        end_time: record.end_time,
        num_sites_crawled: record.num_sites_crawled,
      });
    }
  }
  return processedRecords;
};

const Executions = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const executionData = await fetchExecutions(currentPage);
      if (executionData) {
        const processedData = await processWebsiteRecords(executionData.results);
        setRecords(processedData);
      }
    };

    fetchData();
  }, [currentPage]);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div>
      <table>
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
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>
                <a href={`/records/${record.id}`}>{record.label}</a>
              </td>
              <td>{record.status}</td>
              <td>{record.start_time}</td>
              <td>{record.end_time}</td>
              <td>{record.num_sites_crawled}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={previousPage} disabled={currentPage === 1}>
          Previous Page
        </button>
        <button onClick={nextPage}>Next Page</button>
      </div>
    </div>
  );
};

export default Executions;
