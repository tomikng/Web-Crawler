import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './WebsiteRecordsDetail.css';

  const BASE_URL = 'http://127.0.0.1:8000/api/website_records/';

const WebsiteRecordsDetail = () => {

    const { id } = useParams();

    const [websiteRecord, setwebsiteRecord] = useState(null);

    useEffect(() => {        
        const fetchwebsiteRecordDetails = async () => {
          try {
            const response = await axios.get(`${BASE_URL}${id}/`);
            const data = response.data;
            setwebsiteRecord(data);
          } catch (error) {
            console.error('Error fetching website record details:', error);
          }
        };
    
        fetchwebsiteRecordDetails();
      }, [id]);
    
    return (
    <div className="websiteRecords-details">
         <h2 className="website-records-details__title">Website Records Details - ID: {id}</h2>
         {websiteRecord ? (
        <div className="website-records-details__content">
          <div className="website-records-details__field">
            <strong>ID:</strong> {websiteRecord.id}
          </div>
          <div className="website-records-details__field">
            <strong>Label:</strong> {websiteRecord.label}
          </div>
          <div className="website-records-details__field">
            <strong>ULR:</strong> {websiteRecord.url}
          </div>
          <div className="website-records-details__field">
            <strong>Periodicity:</strong> {websiteRecord.periodicity}
          </div>
          <div className="website-records-details__field">
            <strong>Regex:</strong> {websiteRecord.boundary_regexp}
          </div>
          <div className="website-records-details__field">
            <strong>Tags:</strong> {websiteRecord.tags}
          </div>
          <div className="website-records-details__field">
            <strong>Active:</strong> {websiteRecord.active ? "true" : "false"}
          </div>
         
        </div>
      ) : (
        <p>Loading website records details...</p>
      )}

    </div>
  );
};

export default WebsiteRecordsDetail;
