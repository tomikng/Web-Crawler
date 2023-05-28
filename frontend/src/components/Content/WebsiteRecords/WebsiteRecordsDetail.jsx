import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './WebsiteRecordsDetail.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000/api/website_records';

/**
 * Component for displaying and editing the details of a website record.
 * @returns {JSX.Element} The rendered WebsiteRecordsDetail component.
 */
const WebsiteRecordsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [websiteRecord, setWebsiteRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedRecord, setUpdatedRecord] = useState({});
  const [tags, setTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');

  useEffect(() => {
     /**
     * Fetches the details of the website record with the specified ID.
     * Updates the state with the fetched data.
     * @returns {Promise<void>} A Promise that resolves when the data is fetched and state is updated.
     */
    const fetchWebsiteRecordDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${id}/`);
        const data = response.data;

        console.log(data);

        setTags(data.tags);

        setWebsiteRecord(data);
        setUpdatedRecord(data);
      } catch (error) {
        console.error('Error fetching website record details:', error);
      }
    };

    fetchWebsiteRecordDetails();
  }, [id]);

  /**
   * Handles the delete action for the website record.
   * Sends a delete request to the API and performs additional actions after successful deletion.
   * @returns {Promise<void>} A Promise that resolves when the website record is deleted.
   */
  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/delete/${id}/`);
      // Perform any additional actions after successful deletion
      alert('Website Record was deleted successfully');
      navigate('/websiteRecords');
    } catch (error) {
      console.error('Error deleting website record:', error);
    }
  };

   /**
   * Handles the edit action for the website record.
   * Sets the edit mode to true.
   */
  const handleEdit = () => {
    setEditMode(true);
  };

  /**
   * Handles the change event for the input fields.
   * Updates the state with the new field values.
   * @param {Object} e - The event object representing the change event.
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setUpdatedRecord((prevRecord) => ({
      ...prevRecord,
      [name]: newValue,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInputValue(e.target.value);
  };

  /**
   * Handles the cancel action during editing.
   * Sets the edit mode to false and resets the updated record to the original values.
   */
  const handleCancel = () => {
    setEditMode(false);
    setUpdatedRecord(websiteRecord); // Reset to original values
  };

   /**
   * Handles the save action during editing.
   * Updates the website record with the new values and sends a put request to the API.
   * Performs additional actions after successful update.
   * @returns {Promise<void>} A Promise that resolves when the website record is updated.
   */
  const handleSaveChange = async () => {
    const updatedRecordValues = {
      label: updatedRecord.label,
      url: updatedRecord.url,
      periodicity: updatedRecord.periodicity,
      boundary_regexp: updatedRecord.boundary_regexp,
      active: updatedRecord.active,
      tags: tags
    };

    try {
      const response = await axios.put(`${BASE_URL}/update/${id}/`, updatedRecordValues);
      const updatedRecord = response.data;
      // Perform any additional actions after successful update
      alert('Website Record Details successfully updated');
      setEditMode(false);
      navigate(`/website_records/${id}`);

      setWebsiteRecord(updatedRecord.website_record);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  /**
   * Removes a tag from the tags list.
   * @param {string} tagText - The text of the tag to be removed.
   */
  const removeTag = (tagText) => {
    const updatedTags = tags.filter((tag) => tag !== tagText);
    setTags(updatedTags);
  };

   /**
   * Adds a tag to the tags list.
   */
  const addTag = () => {
    const tagText = tagInputValue.trim();
    if (tagText !== '' && !tags.includes(tagText)) {
      setTags([...tags, tagText]);
      setTagInputValue('');
    }
  };

  return (
    <div>
      <div className="websiteRecords-details">
        <h2 className="website-record-details__title">Website Records Details - ID: {id}</h2>
        {websiteRecord ? (
          <div className="website-record-details__content">
            <div className="website-record-details__field">
              <strong>ID:</strong> {websiteRecord.id}
            </div>
            <div className="website-record-details__field">
              <strong>Label:</strong>{' '}
              {editMode ? (
                <input
                  type="text"
                  name="label"
                  value={updatedRecord.label}
                  onChange={handleInputChange}
                />
              ) : (
                websiteRecord.label
              )}
            </div>
            <div className="website-record-details__field">
              <strong>URL:</strong>{' '}
              {editMode ? (
                <input
                  type="text"
                  name="url"
                  value={updatedRecord.url}
                  onChange={handleInputChange}
                />
              ) : (
                websiteRecord.url
              )}
            </div>
            <div className="website-record-details__field">
              <label htmlFor="periodicity">
                <strong>Periodicity:</strong>
              </label>{' '}
              {editMode ? (
                <select name="periodicity" id="website-record-detail-periodicity" value={updatedRecord.periodicity} onChange={handleInputChange}>
                  <option value="minute">Minute</option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                </select>
              ) : (
                websiteRecord.periodicity
              )}
            </div>
            <div className="website-record-details__field">
              <strong>Regex:</strong>{' '}
              {editMode ? (
                <input
                  type="text"
                  name="boundary_regexp"
                  value={updatedRecord.boundary_regexp}
                  onChange={handleInputChange}
                />
              ) : (
                websiteRecord.boundary_regexp
              )}
            </div>

            <div className="website-record-details__field">
              <label htmlFor="active">
                <strong>Active:</strong>
              </label>{' '}
              {editMode ? (
                <input
                  type="checkbox"
                  id="website-record-active"
                  name="active"
                  checked={updatedRecord.active}
                  onChange={handleInputChange}
                />
              ) : (
                websiteRecord.active ? 'true' : 'false'
              )}
            </div>

            <div className="website-record-details__field">
              <strong>Tags:</strong>{' '}
              {editMode ? (
                <>
                  <div id="tags-container">
                    <input
                      type="text"
                      id="tag-input"
                      placeholder="Add a tag"
                      value={tagInputValue}
                      onChange={handleTagInputChange}
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
                </>
              ) : (
                websiteRecord.tags.join(', ')
              )}
            </div>
          </div>
        ) : (
          <p>Loading website records details...</p>
        )}
      </div>

      <div className="website-record-details__actions">
        {editMode ? (
          <>
            <button className="execution-details__button save-button" onClick={handleSaveChange}>
              Save
            </button>
            <button className="execution-details__button cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="execution-details__button delete-button" onClick={handleDelete}>
              Delete
            </button>
            <button className="execution-details__button edit-button" onClick={handleEdit}>
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WebsiteRecordsDetail;
