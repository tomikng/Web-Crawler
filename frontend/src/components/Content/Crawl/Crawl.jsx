import React, { useState } from 'react';
import './Crawl.css';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

/**
 * Crawl component for crawling websites.
 *
 * @param {object} props - The component props.
 * @param {string} props.initialUrl - The initial URL value for the crawl.
 * @returns {JSX.Element} The Crawl component.
 */
const Crawl = ({ initialUrl }) => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [url, setUrl] = useState(initialUrl || '');
  const [isActive, setIsActive] = useState(initialUrl != undefined);

  /**
   * Adds a tag to the list of tags.
   */
  const addTag = () => {
    const tagText = tagInputValue.trim();

    if (tagText !== '' && !tags.includes(tagText)) {
      setTags([...tags, tagText]);
      setTagInputValue('');
    }
  };

  /**
   * Removes a tag from the list of tags.
   *
   * @param {string} tagText - The tag to remove.
   */
  const removeTag = (tagText) => {
    const updatedTags = tags.filter((tag) => tag !== tagText);
    setTags(updatedTags);
  };

  /**
   * Handles the input change event for the tag input.
   *
   * @param {object} event - The input change event.
   */
  const handleInputChange = (event) => {
    setTagInputValue(event.target.value);
  };

  /**
   * Saves the website record by making a POST request to the server.
   *
   * @param {object} data - The data to save.
   */
  const saveWebsiteRecord = (data) => {
    const base_url = 'http://127.0.0.1:8000/api';
    const endpoint = '/website_records/create/';
    const url = base_url + endpoint;

    axios
      .post(url, data)
      .then(response => {
        console.log('Data saved successfully:', response.data);
        // Handle successful response here
        alert('New crawl saved successfully');
        navigate('/websiteRecords');
      })
      .catch(error => {
        console.error('Error:', error);
        alert(error.response.data.url[0]);
        // Handle error here
      });
  };

  /**
   * Validates the crawl form.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
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

  /**
   * Checks if a URL is valid.
   *
   * @param {string} url - The URL to validate.
   * @returns {boolean} True if the URL is valid, false otherwise.
   */
  const isValidUrl = (url) => {
    const urlRegex = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?' + // port
    '(\\/[-a-z\\d%_.~+]*)*' + // path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i');

    return urlRegex.test(url);
  };

  /**
   * Checks if a regular expression is valid.
   *
   * @param {string} regex - The regular expression to validate.
   * @returns {boolean} True if the regular expression is valid, false otherwise.
   */
  const isValidRegex = (regex) => {
    try {
      new RegExp(regex);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Performs the crawl operation.
   */
  const crawl = () => {
    if (!validateForm()) {
      return;
    }

    const url = document.getElementById('crawl_url').value;
    setUrl(url);

    const regex = document.getElementById('crawl_regex').value;
    const periodicity = document.getElementById('crawl_periodicity').value;
    const label = document.getElementById('crawl_label').value;
    const active = document.getElementById('crawl_active').checked;
    setIsActive(active);

    const data = {
      url: url,
      boundary_regexp: regex,
      periodicity: periodicity,
      label: label,
      active: active,
      tags: tags
    };

    saveWebsiteRecord(data);
  };

  return (
    <div>
      <div className='crawl_form'>
        <h1>Crawl</h1>
        <input type="text" placeholder="Url" name="url" id="crawl_url" value={url} onChange={event => setUrl(event.target.value)} required />
        <input type="text" placeholder="Boundary regexp" name="regex" id="crawl_regex" required />
        <label htmlFor="periodicity">Periodicity:</label>
        <select name="periodicity" id="crawl_periodicity">
          <option value="minute">Minute</option>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
        </select>
        <input type="text" placeholder="Label" name="label" id="crawl_label" required />
        <input type="checkbox" id="crawl_active" name="active" checked={isActive} onChange={event => setIsActive(event.target.checked)} />
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
