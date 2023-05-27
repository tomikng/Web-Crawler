import React, { useEffect, useState } from 'react';
import './WebsiteRecords.css';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';
const recordsPerPage = 5;

const fetchWebsiteRecords = async (currentPage = 1, pageSize = recordsPerPage, sortBy = 'url', filterLabel = '', filterUrl = '', filterTags = []) => {
  try {

    const allExecutions = [];
    let numberOfPage = 1;

    while (true) {
      const executions = await axios.get(`${base_url}/executions/?page=${numberOfPage}`);

      allExecutions.push(...executions.data.results);

      if (executions.data.next !== null) {
        numberOfPage++;
      } else {
        break;
      }
    }

    const uniqueExecutions = {};

    allExecutions.forEach(execution => {
      if (!uniqueExecutions[execution.website_record] || new Date(execution.start_time) > new Date(uniqueExecutions[execution.website_record].start_time)) {
        uniqueExecutions[execution.website_record] = { ...execution };
      }
    });

    const uniqueExecutionsArray = Object.values(uniqueExecutions);


    const response = await axios.get(`${base_url}/website_records/`, {
      params: {
        page: currentPage,
        page_size: pageSize,
        sort: sortBy,
        label: filterLabel,
        url: filterUrl,
        tags: filterTags,
      },
    });

    const websiteRecords = response.data.results;

    const combinedArray = websiteRecords.reduce((result, execution) => {
      const matchingElement = uniqueExecutionsArray.find(element => element.website_record === execution.id);
      if (matchingElement) {
        result.push({ ...execution, ...matchingElement });
      }
      return result;
    }, []);
    
    
    return {
      results: combinedArray,
      current: currentPage,
      total_pages: Math.ceil(response.data.count / pageSize),
    };
  } catch (error) {
    console.error('Error fetching website records:', error);
    return null;
  }
};

const WebsiteRecords = () => {
  const [websiteRecords, setWebsiteRecords] = useState([]);
  const [sortedBy, setSortedBy] = useState('url');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterLabel, setFilterLabel] = useState('');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const websiteRecordsData = await fetchWebsiteRecords(
        currentPage, recordsPerPage, sortedBy, filterLabel, filterUrl, filterTags
      );
      if (websiteRecordsData) {
        setWebsiteRecords(websiteRecordsData.results);
        setCurrentPage(websiteRecordsData.current);
        setTotalPages(websiteRecordsData.total_pages);
      }
    };

    fetchData();
  }, [sortedBy, currentPage, filterLabel, filterUrl, filterTags]);

  const sortIcon = (field) => {
    return sortedBy === field ? <span>&#x25BC;</span> : <span>&#x25B2;</span>;
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const websiteRecordsData = await fetchWebsiteRecords(
      page, recordsPerPage, sortedBy, filterLabel, filterUrl, filterTags
    );
    if (websiteRecordsData) {
      setWebsiteRecords(websiteRecordsData.results);
    }
  };

  const handleFilterLabelChange = async (event) => {
    setFilterLabel(event.target.value);
    const websiteRecordsData = await fetchWebsiteRecords(
      currentPage, recordsPerPage, sortedBy, event.target.value, filterUrl, filterTags
    );
    if (websiteRecordsData) {
      setWebsiteRecords(websiteRecordsData.results);
    }
  };

  const handleFilterUrlChange = async (event) => {
    setFilterUrl(event.target.value);
    const websiteRecordsData = await fetchWebsiteRecords(
      currentPage, recordsPerPage, sortedBy, filterLabel, event.target.value, filterTags
    );
    if (websiteRecordsData) {
      setWebsiteRecords(websiteRecordsData.results);
    }
  };

  const handleFilterTagsChange = async (event) => {
    const inputValue = event.target.value.trim();
    
    // Check if the input is empty
    if (inputValue === '') {
      setFilterTags([]);
      const websiteRecordsData = await fetchWebsiteRecords(
        currentPage, recordsPerPage, sortedBy, filterLabel, filterUrl
      );
      if (websiteRecordsData) {
        setWebsiteRecords(websiteRecordsData.results);
      }
    } else {
      // Split the input value into tags and trim each tag
      const tags = inputValue.split(",").map((tag) => tag.trim());
      setFilterTags(tags);
      const websiteRecordsData = await fetchWebsiteRecords(
        currentPage, recordsPerPage, sortedBy, filterLabel, filterUrl, tags
      );
      if (websiteRecordsData) {
        setWebsiteRecords(websiteRecordsData.results);
      }
    }
};

  return (
    <div>
      <div className="filter-container">
        <input type="text" placeholder="Filter by Label" value={filterLabel} onChange={handleFilterLabelChange} />
        <input type="text" placeholder="Filter by URL" value={filterUrl} onChange={handleFilterUrlChange} />
        <input type="text" placeholder="Filter by Tags" value={filterTags.join(',')} onChange={handleFilterTagsChange} />
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
              <th onClick={() => setSortedBy(sortedBy === 'last_crawled' ? '-last_crawled' : 'last_crawled')}>
                Last time execution {sortIcon('last_crawled')}
              </th>
              <th>Status last execution</th>
        </tr>
      </thead>
      <tbody>
        {websiteRecords.map((websiteRecord) => (
          <tr key={websiteRecord.website_record}>
            <td>{websiteRecord.website_record}</td>
            <td>
              <a href={`/website_records/${websiteRecord.website_record}`}>
                {websiteRecord.label}
              </a>
            </td>
            <td>{websiteRecord.url}</td>
            <td>{websiteRecord.periodicity}</td>
            <td>{websiteRecord.tags.join(', ')}</td>
            <td>{
                new Date(websiteRecord.start_time).toLocaleString()
            }</td>
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
