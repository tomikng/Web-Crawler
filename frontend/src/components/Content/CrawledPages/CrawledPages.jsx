import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CrawledPages.css';
import CustomNodeComponent from './CustomNodeComponent';
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api/graphql/";

let initialEdges = [];

const nodeTypes = {
  customNode: CustomNodeComponent,
};

const CrawledPages = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        query {
          nodes {
            url
            title
            crawlTime
            links {
              url
            }
            owner {
              identifier
              label
              url
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

        console.log(response.data);

        const data = response.data.data;

        const fetchedNodes = data.nodes.map((node, index) => ({
          id: String(index),
          type: 'customNode',
          position: { x: 0, y: 0 + index * 50 },
          data: { label: node.title, url: node.url }
        }));

        const fetchedEdges = data.nodes.map((node, index) => ({
          id: String(index),
          source: node.owner.identifier, 
          target: String(index),  
          markerEnd: {
            type: MarkerType.ArrowClosed,
          }, 
        }));

        setNodes(fetchedNodes);

        setEdges(fetchedEdges);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
