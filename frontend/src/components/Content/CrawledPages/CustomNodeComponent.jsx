import React from 'react';
import { Handle } from 'reactflow';
import './CustomNodeComponent.css';
import { useNavigate } from 'react-router-dom';

/**
 * Custom component for rendering a node in the graph.
 * @param {object} data - Data object for the node containing information like url, title, view mode, etc.
 * @returns {JSX.Element} - CustomNodeComponent JSX element.
 */
const CustomNodeComponent = ({ data }) => {
  const navigate = useNavigate();

  // Check if the URL matches the regex for the website view
  const matchesWebsiteRegex = data.viewMode === "website" && new RegExp(data.owner.regexp).test(data.url);

  // Check if there is a regex restriction for the domain view
  const domainHasRestriction = data.viewMode === "domain" && data.regexpRestricted;

  // Determine the nodeStyle based on both conditions
  const nodeStyle = (matchesWebsiteRegex || domainHasRestriction) ? 'customNode matches' : 'customNode';


  // console.log(nodeStyle, data.url, data.regexpRestricted)

  const handleClick = () => {
    console.log(data.id);
    // Perform any desired operations with the node information
    if(data.viewMode === "website") {
      navigate('/nodeDetail/' + data.id, { state: { data, nodeStyle } });
    }
  };

  return (
    <div className={nodeStyle} onDoubleClick={() => handleClick(nodeStyle)}>
      <div className='labelName'>{data.title}</div>
      <div className='url'>{data.url}</div>
      <Handle type="target" position="left" style={{ background: '#555' }}/>
      <Handle type="source" position="right" style={{ background: '#555' }}/>
    </div>
  );
};

export default CustomNodeComponent;
