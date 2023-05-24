import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CrawledPages.css';
import CustomNodeComponent from './CustomNodeComponent';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000/api/graphql/";

const nodeTypes = {
  customNode: CustomNodeComponent,
};

// Helper function to fetch data
const fetchData = async (website) => {
  const query = `
    query {
      nodes(webPages: "${website}") {
        url
        title
        crawlTime
        links {
          url
          title
        }
        owner {
          identifier
          regexp
        }
      }
    }
  `;

  const response = await axios.post(BASE_URL, { query }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.data;
};

// Helper functions for constructing nodes and edges for different view modes
const constructWebsiteView = (filteredNodesData) => {
  let fetchedEdges = [];
  let fetchedNodes = [];
  let newHashMap = new Map();
  let nodeTree = {};
  let maxDepth = 0;

  filteredNodesData.forEach((node, index) => {
    const nodeId = String(index);
    const dictionaryValue = node.url;
    newHashMap.set(dictionaryValue, nodeId);
    nodeTree[nodeId] = node.links.map(link => newHashMap.get(link.url)).filter(id => id !== undefined);
    maxDepth = Math.max(maxDepth, nodeTree[nodeId].length);
  });

  Object.entries(nodeTree).forEach(([nodeId, children], index) => {
    fetchedNodes.push({
      id: nodeId,
      type: 'customNode',
      position: { x: children.length * (1000 / (maxDepth + 1)), y: index * 100 },
      data: filteredNodesData[index],
    });
  });

  Object.entries(nodeTree).forEach(([sourceId, children]) => {
    children.forEach(targetId => {
      fetchedEdges.push({
        id: `e${sourceId}-${targetId}-${fetchedEdges.length}`,
        source: sourceId,
        target: targetId,
        arrowHeadType: MarkerType.ArrowClosed,
      });
    });
  });

  return { fetchedNodes, fetchedEdges, newHashMap };
};

const constructDomainView = (filteredNodesData) => {
  let fetchedEdges = [];
  let fetchedNodes = [];
  let domainNodes = {};

  filteredNodesData.forEach((node) => {
    if(node.url){
      try {
        const urlObj = new URL(node.url);
        const domain = urlObj.hostname;
        if (!domainNodes[domain]) {
          domainNodes[domain] = {
            id: domain, // use the domain as id to ensure uniqueness
            url: domain,
            links: [],
            title: domain,
            owner: node.owner
          }
        }
        domainNodes[domain].links = [
          ...new Set([...domainNodes[domain].links, // use Set to remove duplicates
            ...node.links.map(link => {
              const linkDomain = new URL(link.url).hostname;
              if (!domainNodes[linkDomain]) {
                // add new domain node if not exists
                domainNodes[linkDomain] = {
                  id: linkDomain,
                  url: linkDomain,
                  links: [],
                  title: linkDomain,
                  owner: node.owner
                }
              }
              return linkDomain;
            })])
        ];
      } catch (error) {
        console.error(`Invalid URL: ${node.url}`);
      }
    }
  });

  // Sort domains alphabetically for better layout
  const sortedDomains = Object.keys(domainNodes).sort();

  // Build nodes and edges
  sortedDomains.forEach((domain, index) => {
    const node = domainNodes[domain];
    fetchedNodes.push({
      id: node.id,
      type: 'customNode',
      position: { x: 100 + index * 150, y: 100 + node.links.length * 50 }, // adjust x and y positions for better layout
      data: { label: node.title, url: node.url, owner: node.owner }
    });

    node.links.forEach((linkDomain, linkIndex) => {
      if (domainNodes[linkDomain]) {
        fetchedEdges.push({
          id: `e${node.id}-${domainNodes[linkDomain].id}-${linkIndex}`,
          source: node.id,
          target: domainNodes[linkDomain].id,
          arrowHeadType: MarkerType.ArrowClosed,
        });
      }
    });
  });

  return { fetchedNodes, fetchedEdges };
};

const CrawledPages = () => {
  const { website } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [viewMode, setViewMode] = useState("website");
  const [hashMap, setHashMap] = useState(new Map());
  const [mode, setMode] = useState("static");

  const handleViewModeChange = useCallback(() => {
    setViewMode(viewMode === "website" ? "domain" : "website");
  }, [viewMode]);

  const handleModeChange = useCallback(() => {
    setMode(mode === "static" ? "live" : "static");
  }, [mode]);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const data = await fetchData(website);
        const filteredNodesData = data.nodes;

        // Rest of the code omitted for brevity
      } catch (error) {
        console.error(error);
      }
    };

    // Update immediately
    loadGraph();

    let intervalId;
    if (mode === "live") {
      // Update periodically if in live mode
      intervalId = setInterval(loadGraph, 1000); // Adjust this to the desired refresh rate
    }

    // Clear interval when mode or website changes
    return () => clearInterval(intervalId);
  }, [website, mode, viewMode]); // Added mode to dependencies


  useEffect(() => {
    const loadGraph = async () => {
      try {
        const data = await fetchData(website);
        const filteredNodesData = data.nodes;

        if (viewMode === "website") {
          const { fetchedNodes, fetchedEdges, newHashMap } = constructWebsiteView(filteredNodesData);
          setNodes(fetchedNodes);
          setEdges(fetchedEdges);
          setHashMap(newHashMap);
        } else if (viewMode === "domain") {
          const { fetchedNodes, fetchedEdges } = constructDomainView(filteredNodesData);
          setNodes(fetchedNodes);
          setEdges(fetchedEdges);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadGraph();
  }, [website, viewMode]);

  const onConnect = (params) => setEdges((eds) => [...eds, params]);

  return (
    <div className="graph-container">
      <button onClick={handleViewModeChange}>Switch to {viewMode === "website" ? "domain" : "website"} view</button>
      <button onClick={handleModeChange}>Switch to {mode === "static" ? "live" : "static"} mode</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CrawledPages;
