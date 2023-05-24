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

const BASE_URL = "http://127.0.0.1:8000/api/graphql/";

const nodeTypes = {
  customNode: CustomNodeComponent,
};

const CrawledPages = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hashMap, setHashMap] = useState(new Map()); // Use Map for the hashmap

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        query {
          nodes {
            url
            title
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
            data: { label: filteredNodesData[index].title, url: filteredNodesData[index].url, owner: filteredNodesData[index].owner }
          });
        });

        // Build edges
        Object.entries(nodeTree).forEach(([sourceId, children]) => {
          children.forEach(targetId => {
            fetchedEdges.push({
              id: 'e' + sourceId + '-' + targetId,
              source: sourceId,
              target: targetId,
              arrowHeadType: MarkerType.ArrowClosed,
            });
          });
        });

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);

      } catch (error) {
        console.error(error);
      }
    };




    fetchData();
  }, [setNodes]);

  const onConnect = (params) => setEdges((eds) => [...eds, params]);

  const onClickHandle = (event) => {
    const nodeElement = event.target.closest('.react-flow__node');
    if (nodeElement) {
      const labelName = nodeElement.querySelector('.labelName').innerText;
      const url = nodeElement.querySelector('.url').innerText;
      console.log(labelName);
      console.log(url);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onClick={onClickHandle}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CrawledPages;
