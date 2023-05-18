import React from 'react';
import { Handle } from 'reactflow';


const CustomNodeComponent = ({ data }) => {
  return (
    <div style={{ border: '1px solid black' }}>
      <div className='labelName'>{data.label}</div>
      <div className='url'>{data.url}</div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
};

export default CustomNodeComponent;