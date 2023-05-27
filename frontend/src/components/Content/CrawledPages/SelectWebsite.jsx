import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

// const fetchWebsiteRecords = async () => {
//   try {
//     const response = await axios.get(`${base_url}/website_records/`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching website records:', error);
//     return null;
//   }
// };


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
    // console.log(allWebsiteRecords)

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
      console.log(data[0]);
      if (data && data.length > 0) {
        setSelectedWebsite(data[0].id);
      }

      setWebsiteRecords(data);
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
