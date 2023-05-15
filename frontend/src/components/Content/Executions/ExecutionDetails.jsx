import React from 'react';
import { useParams } from 'react-router-dom';

const ExecutionDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Execution Details - ID: {id}</h2>
      {/* Implement the logic to fetch and display the details for the execution record with the given ID */}
    </div>
  );
};

export default ExecutionDetails;
