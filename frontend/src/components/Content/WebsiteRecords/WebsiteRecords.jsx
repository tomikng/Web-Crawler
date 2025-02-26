import React, { useEffect, useState } from 'react';
import './WebsiteRecords.css';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';
const recordsPerPage = 5;

/**
 * Fetches website records with associated execution data from the API.
 * @param {number} currentPage - The current page number.
 * @param {number} pageSize - The number of records per page.
 * @param {string} sortBy - The field to sort the records by.
 * @param {string} filterLabel - The label to filter the records by.
 * @param {string} filterUrl - The URL to filter the records by.
 * @param {Array<string>} filterTags - The tags to filter the records by.
 * @returns {Promise<Object|null>} A Promise that resolves to an object containing the fetched website records and associated execution data,
 * along with the current page number and total number of pages, or null if an error occurs.
 */
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

    let mergedRecords = websiteRecords.map(websiteRecord => {
      // Look for a matching execution for this website record.
      const execution = uniqueExecutionsArray.find(exec => exec.website_record === websiteRecord.id);

      // If a matching execution was found, combine its data with the website record's data.
      if (execution) {
        return {
          ...websiteRecord,
          execution
        };
      }

      // If no matching execution was found, return the website record data as is.
      return websiteRecord;
    });

    return {
      // results: combinedArray,
      results: mergedRecords,
      current: currentPage,
      total_pages: Math.ceil(response.data.count / pageSize),
    };
  } catch (error) {
    console.error('Error fetching website records:', error);
    return null;
  }
};


/**
 * Component for displaying and filtering website records.
 * @returns {JSX.Element} The rendered WebsiteRecords component.
 */
const WebsiteRecords = () => {
  const [websiteRecords, setWebsiteRecords] = useState([]);
  const [sortedBy, setSortedBy] = useState('url');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterLabel, setFilterLabel] = useState('');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTags, setFilterTags] = useState([]);

   // Fetch website records on component mount and whenever the sorting, pagination, or filter settings change
  useEffect(() => {
     /**
     * Fetches website records based on the current sorting, pagination, and filter settings.
     * Updates the state with the fetched data.
     * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
     */
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

   /**
   * Renders an icon indicating the sorting direction for a field.
   * @param {string} field - The field to check the sorting for.
   * @returns {JSX.Element} The icon element indicating the sorting direction.
   */
  const sortIcon = (field) => {
    return sortedBy === field ? <span>&#x25BC;</span> : <span>&#x25B2;</span>;
  };

  /**
   * Handles the page change event and fetches the corresponding website records.
   * @param {number} page - The page number to navigate to.
   * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
   */
  const handlePageChange = async (page) => {

    if(currentPage <= totalPages){
        setCurrentPage(page);
        const websiteRecordsData = await fetchWebsiteRecords(
          page, recordsPerPage, sortedBy, filterLabel, filterUrl, filterTags
        );
        if (websiteRecordsData) {
          setWebsiteRecords(websiteRecordsData.results);
        }
    }
   
  };


  /**
   * Handles the filter label change event and fetches the filtered website records.
   * @param {Object} event - The event object representing the change event.
   * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
   */
  const handleFilterLabelChange = async (event) => {
    setFilterLabel(event.target.value);
    const websiteRecordsData = await fetchWebsiteRecords(
      currentPage, recordsPerPage, sortedBy, event.target.value, filterUrl, filterTags
    );
    if (websiteRecordsData) {
      setWebsiteRecords(websiteRecordsData.results);
    }
  };


  /**
   * Handles the filter URL change event and fetches the filtered website records.
   * @param {Object} event - The event object representing the change event.
   * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
   */
  const handleFilterUrlChange = async (event) => {
    setFilterUrl(event.target.value);
    const websiteRecordsData = await fetchWebsiteRecords(
      currentPage, recordsPerPage, sortedBy, filterLabel, event.target.value, filterTags
    );
    if (websiteRecordsData) {
      setWebsiteRecords(websiteRecordsData.results);
    }
  };


   /**
   * Handles the filter tags change event and fetches the filtered website records.
   * @param {Object} event - The event object representing the change event.
   * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
   */
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
          <tr key={websiteRecord.id}>
            <td>{websiteRecord.id}</td>
            <td>
              <a href={`/website_records/${websiteRecord.id}`}>
                {websiteRecord.label}
              </a>
            </td>
            <td>{websiteRecord.url}</td>
            <td>{websiteRecord.periodicity}</td>
            <td>{websiteRecord.tags.join(', ')}</td>
            <td>{
                websiteRecord.execution ? new Date(websiteRecord.execution?.start_time).toLocaleString() : "No execution"
            }</td>
            <td>{websiteRecord.execution ? websiteRecord.execution?.status: "No execution"}</td>
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
