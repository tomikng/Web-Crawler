import React from 'react';
import { Handle } from 'reactflow';
import './CustomNodeComponent.css';
import { useNavigate } from 'react-router-dom';

const CustomNodeComponent = ({ data }) => {
  const navigate = useNavigate();
  // Check if the URL matches the regex
  const matchesRegex = new RegExp(data.owner.regexp).test(data.url);
  const nodeStyle = matchesRegex ? 'customNode matches' : 'customNode';

  const handleClick = () => {
    console.log(data.id);
    // Perform any desired operations with the node information
    navigate('/nodeDetail/' + data.id, { state: { data, nodeStyle } });
  };


  return (
    <div className={nodeStyle} onDoubleClick={() => handleClick(nodeStyle)}>
      <div className='labelName'>{data.label}</div>
      <div className='url'>{data.url}</div>
      <Handle type="target" position="right" style={{ background: '#555' }}/>
      <Handle type="source" position="left" style={{ background: '#555' }}/>
    </div>
  );
};

export default CustomNodeComponent;
