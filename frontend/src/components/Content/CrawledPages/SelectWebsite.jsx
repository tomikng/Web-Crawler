import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

/**
 * Fetches all website records from the API.
 * @returns {Promise<Array>} - Array of website records.
 */
const fetchWebsiteRecords = async () => {
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

      setWebsiteRecords(data);
    };

    fetchData();
  }, []);

  /**
   * Event handler for form submission.
   * @param {object} event - Form submit event.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
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
