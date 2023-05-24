import React, { useEffect, useState } from 'react';
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

const CrawledPages = () => {
  const { website } = useParams();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [viewMode, setViewMode] = useState("website");
  const [hashMap, setHashMap] = useState(new Map());

  const handleViewModeChange = () => {
    setViewMode(viewMode === "website" ? "domain" : "website");
  };

  useEffect(() => {
    const fetchData = async () => {
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
              regexp
            }
          }
        }
      `;

      try {
        const response = await axios.post(BASE_URL, {
          query: query
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = response.data.data;
        const filteredNodesData = data.nodes;
        let fetchedEdges = [];
        let fetchedNodes = [];
        let newHashMap = new Map();
        let nodeTree = {};
        let maxDepth = 0;

        if (viewMode === "website") {
          // Website view mode
          // Construct HashMap and nodeTree
          filteredNodesData.forEach((node, index) => {
            const nodeId = String(index);
            const dictionaryValue = node.url;

            // Update hashmap with {url: id}
            newHashMap.set(dictionaryValue, nodeId);

            // Update nodeTree with {id: child_ids}
            nodeTree[nodeId] = node.links.map(link => newHashMap.get(link.url)).filter(id => id !== undefined);
            maxDepth = Math.max(maxDepth, nodeTree[nodeId].length);
          });

          // Update HashMap state
          setHashMap(newHashMap);

          console.log(filteredNodesData)

          // Construct nodes with positions based on depth
          Object.entries(nodeTree).forEach(([nodeId, children], index) => {
            fetchedNodes.push({
              id: nodeId,
              type: 'customNode',
              position: { x: children.length * (1000 / (maxDepth + 1)), y: index * 100 },
              data: { 
                id: nodeId,
                label: filteredNodesData[index].title, 
                url: filteredNodesData[index].url, 
                links: filteredNodesData[index].links,
                crawlTime: filteredNodesData[index].crawlTime,
                owner: filteredNodesData[index].owner   
              }
            });
          });

          // Build edges
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


        } else if (viewMode === "domain") {
          // Domain view mode
          // Group by domain
          let domainNodes = {};
          filteredNodesData.forEach((node, index) => {
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
        }

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [website, viewMode, setNodes, setEdges, setHashMap]);

  const onConnect = (params) => setEdges((eds) => [...eds, params]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={handleViewModeChange}>Switch to {viewMode === "website" ? "domain" : "website"} view</button>
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