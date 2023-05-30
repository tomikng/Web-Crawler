import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  useNodesState, 
  useEdgesState,
  addEdge,
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
import dagre from 'dagre';

const BASE_URL = "http://127.0.0.1:8000/api/graphql/";

const nodeTypes = {
  customNode: CustomNodeComponent,
};

/**
 * Fetches data for a given website.
 *
 * @param {string} website - The website to fetch data for.
 * @returns {Promise<object>} - The fetched data.
 */
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

/**
 * Constructs the website view for the crawled pages.
 *
 * @param {Array} filteredNodesData - The filtered nodes data.
 * @returns {Object} - The constructed nodes, edges, and hashmap.
 */
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

  Object.entries(nodeTree).forEach(([nodeId], index) => {
    fetchedNodes.push({
      id: nodeId,
      type: 'customNode',
      position: { x: 0, y: 0},
      data: {
        ...filteredNodesData[index],
        viewMode: "website"
      },
    });
  });

  Object.entries(nodeTree).forEach(([sourceId, children]) => {
    children.forEach(targetId => {
      fetchedEdges.push({
        id: `e${sourceId}-${targetId}-${fetchedEdges.length}`,
        source: sourceId,
        target: targetId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      });
    });
  });

  return { fetchedNodes, fetchedEdges, newHashMap };
};


/**
 * Constructs the domain view for the crawled pages.
 *
 * @param {Array} filteredNodesData - The filtered nodes data.
 * @returns {Object} - The constructed nodes and edges.
 */
const constructDomainView = (filteredNodesData) => {
  let fetchedEdges = [];
  let fetchedNodes = [];
  let domainNodes = {};
  let domainWithRegexpRestrictedPage = new Set();


  filteredNodesData.forEach((node) => {
    if(node.url){
      let urlObj;
      try {
        urlObj = new URL(node.url);
      } catch (error) {
        console.error(`Invalid URL: ${node.url}`);
        return; // Skip to the next iteration if the URL is not valid
      }
      const domain = urlObj.hostname;
      // Check if the node URL matches the regexp
      const matchesRegexp = new RegExp(node.owner.regexp).test(node.url);
      if (matchesRegexp) {
        domainWithRegexpRestrictedPage.add(domain);
      }

      if (!domainNodes[domain]) {
        domainNodes[domain] = {
          id: domain, // use the domain as id to ensure uniqueness
          url: domain,
          links: [],
          title: domain,
          owner: node.owner,
        };
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

    }
  });

  // Sort domains alphabetically for better layout
  const sortedDomains = Object.keys(domainNodes).sort();

  // Build nodes and edges
  sortedDomains.forEach((domain, index) => {
    const node = domainNodes[domain];
    const regexpRestricted = domainWithRegexpRestrictedPage.has(domain);
      fetchedNodes.push({
        id: node.id,
        type: 'customNode',
        position: { x: 0, y: 0},
        data: {
          label: node.title,
          url: node.url,
          owner: node.owner,
          regexpRestricted,
          viewMode: "domain"
        }
      });

    node.links.forEach((linkDomain, linkIndex) => {
      if (domainNodes[linkDomain]) {
        fetchedEdges.push({
          id: `e${node.id}-${domainNodes[linkDomain].id}-${linkIndex}`,
          source: node.id,
          target: domainNodes[linkDomain].id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });
  });

  return { fetchedNodes, fetchedEdges };
};

const defaultNodeWidth = 150;
const defaultNodeHeight = 50;


/**
 * Represents the component that renders the crawled pages graph.
 */
const CrawledPages = () => {
  // Extracting the 'website' parameter from the URL
  const { website } = useParams();

  // State variables for graph nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State variables for view mode, hashmap, and mode
  const [viewMode, setViewMode] = useState("domain");
  const [hashMap, setHashMap] = useState(new Map());
  const [mode, setMode] = useState("live");

  /**
   * Event handler for toggling the view mode between 'website' and 'domain'.
   */
  const handleViewModeChange = useCallback(() => {
    setViewMode(viewMode === "website" ? "domain" : "website");
  }, [viewMode]);

  /**
   * Event handler for toggling the mode between 'live' and 'static'.
   */
  const handleModeChange = useCallback(() => {
    setMode(mode === "static" ? "live" : "static");
  }, [mode]);

  // Effect hook for graph layout
  useEffect(() => {
    // Create a new dagre graph
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'LR' // set graph direction to top-bottom
    });

    const scaleFactor = 2;

    // Set the nodes' dimensions in the graph
    nodes.forEach((node) => {
      g.setNode(node.id, {
        width: (node.__rf?.width || defaultNodeWidth) * scaleFactor,
        height: (node.__rf?.height || defaultNodeHeight) * scaleFactor
      });
    });

    // Set the edges in the graph
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Perform the graph layout using dagre
    dagre.layout(g);

    // Update the node positions based on the layout
    g.nodes().forEach((nodeId) => {
      const nodeInfo = g.node(nodeId);
      const node = nodes.find((el) => el.id === nodeId);
      if (node) {
        // Ensure node is not undefined
        node.position = {
          x: nodeInfo?.x - (node?.__rf?.width || defaultNodeWidth) / 2,
          y: nodeInfo?.y - (node?.__rf?.height || defaultNodeHeight) / 2
        };
      } else {
        // console.warn(`Node with id ${nodeId} not found in nodes array`);
      }
    });

    setNodes([...nodes]);
  }, [nodes, edges, setNodes]);

  // Effect hook for fetching and updating the graph data
  useEffect(() => {
    // Fetch the data first, and then set state
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

    // Update immediately
    loadGraph();

    let intervalId;
    if (mode === "live") {
      // Update periodically if in live mode
      intervalId = setInterval(loadGraph, 2000); // Adjust this to the desired refresh rate
    }

    // Clear interval when mode or website changes
    return () => clearInterval(intervalId);
  }, [website, mode, viewMode]);

  /**
   * Event handler for connecting nodes in the graph.
   * @param {object} params - Connection parameters (source, target, etc.).
   */
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="graph-container">
      <button onClick={handleViewModeChange}>Switch to {viewMode === "website" ? "domain" : "website"} view</button>
      <button onClick={handleModeChange}>Switch to {mode === "static" ? "live" : "static"} mode</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CrawledPages;