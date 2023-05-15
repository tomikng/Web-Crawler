import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ExecutionDetails.css'; // Import the CSS file for styling

const ExecutionDetails = () => {
  const { id } = useParams();
  const [execution, setExecution] = useState(null);

  const BASE_URL = 'http://127.0.0.1:8000/api/executions/';

  useEffect(() => {
    const fetchExecutionDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${id}/`);
        const data = response.data;
        setExecution(data);
      } catch (error) {
        console.error('Error fetching execution details:', error);
      }
    };

    fetchExecutionDetails();
  }, [id]);

  return (
    <div className="execution-details">
      <h2 className="execution-details__title">Execution Details - ID: {id}</h2>
      {execution ? (
        <div className="execution-details__content">
          <div className="execution-details__field">
            <strong>ID:</strong> {execution.id}
          </div>
          <div className="execution-details__field">
            <strong>Status:</strong> {execution.status}
          </div>
          <div className="execution-details__field">
            <strong>Start Time:</strong> {execution.start_time}
          </div>
          <div className="execution-details__field">
            <strong>End Time:</strong> {execution.end_time}
          </div>
          <div className="execution-details__field">
            <strong>Number of Sites Crawled:</strong> {execution.num_sites_crawled}
          </div>
          <div className="execution-details__field">
            <strong>Website Record:</strong> {execution.website_record}
          </div>
        </div>
      ) : (
        <p>Loading execution details...</p>
      )}
    </div>
  );
};

export default ExecutionDetails;
