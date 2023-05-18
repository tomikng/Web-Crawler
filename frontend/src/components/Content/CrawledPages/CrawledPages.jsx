import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CrawledPages.css';
import CustomNodeComponent from './CustomNodeComponent';

const initialNodes = [
  { id: '1', type: 'customNode', position: { x: 0, y: 0 }, data: { label: 'xxx', url: 'https://www.matfyz.cz/kontakt' } },
  { id: '2', type: 'customNode', position: { x: 0, y: 100 }, data: { label: '2', url: 'https://www.googletagmanager.com' } },
  { id: '3', type: 'customNode', position: { x: 0, y: 100 }, data: { label: '2', url: 'https://www.googletagmanager.com' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const nodeTypes = {
  customNode: CustomNodeComponent,
};

const CrawledPages = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
