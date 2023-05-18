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

const processWebsiteRecords = async (records, sortBy) => {
  const processedRecords = [];
  for (const record of records) {
    const websiteRecord = await fetchWebsiteRecords(record.website_record);

    if (websiteRecord) {
      const { label } = websiteRecord;
      processedRecords.push({
        id: record.id,
        websiteRecord: websiteRecord.id,
        label: label,
        url: websiteRecord.url,
        periodicity: websiteRecord.periodicity,
        tags: websiteRecord.tags,
        start_time: new Date(record.start_time).toLocaleString(),
        status: record.status
      });
    }
  }

  processedRecords.sort((a, b) => {	
    if (sortBy === 'url') {	
      return a.url.localeCompare(b.url);	
    } else if (sortBy === '-url') {	
      return b.url.localeCompare(a.url);	
    } else if (sortBy === 'start_time') {	
      return new Date(a.start_time) - new Date(b.start_time);	
    } else if (sortBy === '-start_time') {	
      return new Date(b.start_time) - new Date(a.start_time);	
    }	
    return 0;	
  });

  return processedRecords;
};

const WebsiteRecords = () => {
  const [websiteRecords, setWebsiteRecords] = useState([]);
  const [sortedBy, setSortedBy] = useState('url');  
  const [currentPage, setCurrentPage] = useState(1);  
  const recordsPerPage = 5;

  const [filterLabel, setFilterLabel] = useState('');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTags, setFilterTags] = useState('');

  const [displayedRecords, setDisplayedRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const executionData = await fetchExecutions();
      if (executionData) {
        const processedData = await processWebsiteRecords(executionData, sortedBy);
        console.log(processedData);
        setWebsiteRecords(processedData);
      }
    };

    fetchData();
  }, [sortedBy]); 


  useEffect(() => {
    // Apply filters and pagination when websiteRecords or filters change
    const filteredRecords = applyFilters(websiteRecords);
    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage - 1, totalRecords - 1);
    setDisplayedRecords(filteredRecords.slice(startIndex, endIndex + 1));
  }, [websiteRecords, filterLabel, filterUrl, filterTags, currentPage]);

  const sortIcon = (field) => {	
    return sortedBy === field ? <span>&#x25BC;</span> : <span>&#x25B2;</span>;
  };

  const applyFilters = (records) => {
    return records.filter((record) => {
      const labelMatch = record.label.toLowerCase().includes(filterLabel.toLowerCase());
      const urlMatch = record.url.toLowerCase().includes(filterUrl.toLowerCase());
      const tagsMatch = record.tags.toLowerCase().includes(filterTags.toLowerCase());
      return labelMatch && urlMatch && tagsMatch;
    });
  };

   const filteredRecords = applyFilters(websiteRecords);
   // Calculate pagination values  
   const totalRecords = filteredRecords.length;  
   const totalPages = Math.ceil(totalRecords / recordsPerPage);  
   const startIndex = (currentPage - 1) * recordsPerPage;  
   const endIndex = Math.min(startIndex + recordsPerPage - 1, totalRecords - 1);  
   const currentRecords = filteredRecords.slice(startIndex, endIndex + 1);  
   const handlePageChange = (page) => {  
     setCurrentPage(page);  
   };

  const handleFilterLabelChange = (event) => {
    setFilterLabel(event.target.value);
  };

  const handleFilterUrlChange = (event) => {
    setFilterUrl(event.target.value);
  };

  const handleFilterTagsChange = (event) => {
    setFilterTags(event.target.value);
  };

  // currentRecords = applyFilters(websiteRecords);

  return (
    <div>
      <div className="filter-container">
        <input type="text" placeholder="Filter by Label" value={filterLabel} onChange={handleFilterLabelChange} />
        <input type="text" placeholder="Filter by URL" value={filterUrl} onChange={handleFilterUrlChange} />
        <input type="text" placeholder="Filter by Tags" value={filterTags} onChange={handleFilterTagsChange} />
      </div>
      <div className="websites-records-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Label</th>
              <th onClick={() => setSortedBy(sortedBy === 'url' ? '-url' : 'url')}>	
                  Url {sortIcon('url')}	
              </th>
              <th>Periodicity</th>
              <th>Tags</th>
              <th onClick={() => setSortedBy(sortedBy === 'start_time' ? '-start_time' : 'start_time')}>	
                Last time execution {sortIcon('start_time')}	
              </th>
              <th>Status last execution</th>
        </tr>
      </thead>
      <tbody>
          {displayedRecords.map((websiteRecord) => (	
            <tr key={websiteRecord.id}>	
              <td>{websiteRecord.websiteRecord}</td>	
              <td>	
                <a href={`/website_records/${websiteRecord.websiteRecord}`}>	
                  {websiteRecord.label}	
                </a>	
              </td>	
              <td>{websiteRecord.url}</td>	
              <td>{websiteRecord.periodicity}</td>	
              <td>{websiteRecord.tags}</td>	
              <td>{websiteRecord.start_time}</td>	
              <td>{websiteRecord.status}</td>	
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

export default WebsiteRecords;