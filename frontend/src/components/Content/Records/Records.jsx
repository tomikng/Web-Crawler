import React, { useEffect } from 'react';
import './Records.css';
import axios from 'axios';

const Records = () => {
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
      Records
    </div>
  );
}

export default Records;
