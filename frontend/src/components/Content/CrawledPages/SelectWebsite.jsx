import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

const fetchWebsiteRecords = async () => {
  try {
    const response = await axios.get(`${base_url}/website_records/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching website records:', error);
    return null;
  }
};

const SelectWebsite = () => {
  const navigate = useNavigate();
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [websiteRecords, setWebsiteRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchWebsiteRecords();
      if (data && data.length > 0) {
        setSelectedWebsite(data[0].id);
      }

      console.log(data);

      setWebsiteRecords(data.results);
    };

    fetchData();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(selectedWebsite)
    navigate(`/crawledPages/${selectedWebsite}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Select a website:
        <select value={selectedWebsite || ''} onChange={e => setSelectedWebsite(e.target.value)}>
          {
            websiteRecords.map(record => (
              <option key={record.id} value={record.id}>{record.label} - {record.url}</option>
            ))
          }
        </select>
      </label>
      <input type="submit" value="Go to Visualization" />
    </form>
  );
};

export default SelectWebsite;
