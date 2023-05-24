import React from 'react';
import { Handle } from 'reactflow';
import './CustomNodeComponent.css';

const CustomNodeComponent = ({ data }) => {
  // Check if the URL matches the regex
  const matchesRegex = new RegExp(data.owner.regexp).test(data.url);
  const nodeStyle = matchesRegex ? 'customNode matches' : 'customNode';

  return (
    <div className={nodeStyle}>
      <div className='labelName'>{data.label}</div>
      <div className='url'>{data.url}</div>
      <Handle type="target" position="right" style={{ background: '#555' }}/>
      <Handle type="source" position="left" style={{ background: '#555' }}/>
    </div>
  );
};

export default CustomNodeComponent;
