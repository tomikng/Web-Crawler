import React, { useEffect, useState } from 'react';
import './WebsiteRecords.css';
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
        websiteRecord: websiteRecord.id,
        label:label,
        url: websiteRecord.url,
        periodicity: websiteRecord.periodicity,
        status: record.status,
        tags: websiteRecord.tags,
        start_time: new Date(record.start_time).toLocaleString(),
        status: record.status
      });
    }
  }
  return processedRecords;
};


const WebsiteRecords = () => {
  
  const [wesiteRecords, setWesiteRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const executionData = await fetchExecutions();
      if (executionData) {
        const processedData = await processWebsiteRecords(executionData);
        setWesiteRecords(processedData);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
        <div className="websites-records-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>Url</th>
                  <th>Periodicity</th>
                  <th>Tags</th>
                  <th>Last time execution</th>
                  <th>Status last execution</th>
                </tr>
              </thead>
              <tbody>
                {wesiteRecords.map((wesiteRecord) => (
                  <tr key={wesiteRecord.websiteRecord}>
                    <td>{wesiteRecord.websiteRecord}</td>
                    <td>
                      <a href={`/website_records/${wesiteRecord.websiteRecord}`}>{wesiteRecord.label}</a>
                    </td>
                    <td>{wesiteRecord.url}</td>
                    <td>{wesiteRecord.periodicity}</td>
                    <td>{wesiteRecord.tags}</td>
                    <td>{wesiteRecord.start_time}</td>
                    <td>{wesiteRecord.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>
  );

};

export default WebsiteRecords;