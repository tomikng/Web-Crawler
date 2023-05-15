import React, { useState } from 'react';
import './Crawl.css';
import axios from "axios";

const Crawl = () => {

  const [tags, setTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');

  const addTag = () => {
    const tagText = tagInputValue.trim();

    if (tagText !== '' && !tags.includes(tagText)) {
      setTags([...tags, tagText]);
      setTagInputValue('');
    }
  };

  const removeTag = (tagText) => {
    const updatedTags = tags.filter((tag) => tag !== tagText);
    setTags(updatedTags);
  };

  const handleInputChange = (event) => {
    setTagInputValue(event.target.value);
  };

  const saveWebsiteRecord = (data) => {
    const base_url = 'http://127.0.0.1:8000/api';
    const endpoint = '/website_records/create/';
    const url = base_url + endpoint;

    axios
      .post(url, data)
      .then(response => {
        console.log('Data saved successfully:', response.data);
        // Handle successful response here
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle error here
      });
  };

  const validateForm = () => {
    const urlInput = document.getElementById('crawl_url');
    const regexInput = document.getElementById('crawl_regex');
    const url = urlInput.value.trim();
    const regex = regexInput.value.trim();
    const periodicity = document.getElementById('crawl_periodicity').value;
    const label = document.getElementById('crawl_label').value;

    if (url === '') {
      alert('Please enter a URL');
      return false;
    }

    if (!isValidUrl(url)) {
      alert('Please enter a valid URL');
      urlInput.focus();
      return false;
    }

    if (regex === '') {
      alert('Please enter a boundary regexp');
      return false;
    }

    if (!isValidRegex(regex)) {
      alert('Please enter a valid boundary regexp');
      regexInput.focus();
      return false;
    }

    if (periodicity.trim() === '') {
      alert('Please select a periodicity');
      return false;
    }

    if (label.trim() === '') {
      alert('Please enter a label');
      return false;
    }

    return true;
  };

  const isValidUrl = (url) => {
    const urlRegex = /^(https?:\/\/)?([\w.-]+)(\.[\w.-]+)\/?$/;
    return urlRegex.test(url);
  };

  const isValidRegex = (regex) => {
    try {
      new RegExp(regex);
      return true;
    } catch (error) {
      return false;
    }
  };

  const crawl = () => {
    if (!validateForm()) {
      return;
    }

    const url = document.getElementById('crawl_url').value;
    const regex = document.getElementById('crawl_regex').value;
    const periodicity = document.getElementById('crawl_periodicity').value;
    const label = document.getElementById('crawl_label').value;
    const active = document.getElementById('crawl_active').checked;

    const data = {
      url: url,
      boundary_regexp: regex,
      periodicity: periodicity,
      label: label,
      active: active,
      tags: tags.join(",")
    };

    saveWebsiteRecord(data);
  };


  return (
    <div>
      <div className='crawl_form'>
          <h1>Crawl</h1>
          <input type="text" placeholder="Url" name="url" id="crawl_url" required />
          <input type="text" placeholder="Boundary regexp" name="regex" id="crawl_regex" required />
          <label htmlFor="periodicity">Periodicity:</label>
          <select name="periodicity" id="crawl_periodicity">
            <option value="minute">Minute</option>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
          </select>
          <input type="text" placeholder="Label" name="label" id="crawl_label" required />
          <input type="checkbox" id="crawl_active" name="active" value="active" />
          <label htmlFor="active"> Active </label>

          <div id="tags-container">
            <input
              type="text"
              id="tag-input"
              placeholder="Add a tag"
              value={tagInputValue}
              onChange={handleInputChange}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  addTag();
                }
              }}
            />
          </div>
          <div id="tag-list">
            {tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
                <button onClick={() => removeTag(tag)}>x</button>
              </span>
            ))}
          </div>
          <button className='crawl_button' onClick={() => crawl()}>Crawl</button>
      </div>

      
    </div>


  );
};

export default Crawl;