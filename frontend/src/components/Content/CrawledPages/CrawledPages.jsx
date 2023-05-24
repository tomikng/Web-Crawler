import React, { useCallback, useEffect, useState } from 'react';
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

  const [hashMap, setHashMap] = useState(new Map()); // Use Map for the hashmap

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

        const data = response.data.data;

        const filteredNodesData = data.nodes;

        const fetchedNodes = filteredNodesData.map((node, index) => {
          const nodeId = String(index);
          const dictionaryValue = node.url;

          // Update hashmap with {id: node.url}
          setHashMap(prevHashMap => new Map(prevHashMap).set(dictionaryValue, nodeId));

          return {
            id: nodeId,
            type: 'customNode',
            position: { x: 0, y: 0 + index * 50 },
            data: { label: node.title, url: node.url }
          };
        });

        const fetchedEdges = data.nodes.map((node, index) => {



          // console.log(node.links);
          for(let i = 0; i < node.links.length; i++){

            const targetNode = hashMap.get(node.links[i].url);

            console.log(targetNode);

             return{
              id: String(index) + targetNode,
              source: String(index),
              target: targetNode,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }
          }

          // return{
          //   id: String(index),
          //   source: node.owner.identifier,
          //   target: String(index),
          //   markerEnd: {
          //     type: MarkerType.ArrowClosed,
          //   },
          // }

        });

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);


      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [setNodes, hashMap]);

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
