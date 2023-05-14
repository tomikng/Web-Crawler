import React, { useEffect } from 'react';
import './CrawledPages.css';
import axios from 'axios';

const CrawledPages = () => {
  useEffect(() => {
    axios.post('http://127.0.0.1:8000/api/', {
      query: `
        query {
            websites {
            identifier
            label
            url
            regexp
            tags
            active
            }
        }
      
      `
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      CrawledPages
    </div>
  );
}

export default CrawledPages;
