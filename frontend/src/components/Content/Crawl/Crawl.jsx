import React, { useState } from 'react';
import './Crawl.css';

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

  return (
    <div>
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



      <button className='crawl_button'>Crawl</button>
    </div>


  );
};

export default Crawl;