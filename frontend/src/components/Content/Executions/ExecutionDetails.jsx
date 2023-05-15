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

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}${id}/`);
      // Perform any additional actions after successful deletion
    } catch (error) {
      console.error('Error deleting execution:', error);
    }
  };

  const handleEdit = () => {
    // Implement the logic for editing the execution details
  };

  const handleStartExecution = () => {
    // Implement the logic for starting the execution
  };

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

          <div className="execution-details__actions">
            <button className="execution-details__button" onClick={handleDelete}>
              Delete
            </button>
            <button className="execution-details__button" onClick={handleEdit}>
              Edit
            </button>
            <button className="execution-details__button" onClick={handleStartExecution}>
              Start Execution
            </button>
          </div>
        </div>
      ) : (
        <p>Loading execution details...</p>
      )}
    </div>
  );
};

export default ExecutionDetails;
