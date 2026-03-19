import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  addEdge,
} from "@xyflow/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialNodes: any[] = [
  {
    id: "A",
    type: "group",
    position: { x: 0, y: 0 },
    style: {
      width: 170,
      height: 140,
    },
  },
  {
    id: "A-1",
    type: "input",
    data: { label: "Child Node 1" },
    position: { x: 10, y: 10 },
    parentId: "A",
    extent: "parent",
  },
  {
    id: "A-2",
    data: { label: "Child Node 2" },
    position: { x: 10, y: 90 },
    parentId: "A",
    extent: "parent",
  },
  {
    id: "B",
    type: "output",
    position: { x: -100, y: 200 },
    data: null,
    style: {
      width: 170,
      height: 140,
      backgroundColor: "rgba(240,240,240,0.25)",
    },
  },
  {
    id: "B-1",
    data: { label: "Child 1" },
    position: { x: 50, y: 10 },
    parentId: "B",
    extent: "parent",
    draggable: false,
    style: {
      width: 60,
    },
  },
  {
    id: "B-2",
    data: { label: "Child 2" },
    position: { x: 10, y: 90 },
    parentId: "B",
    extent: "parent",
    draggable: false,
    style: {
      width: 60,
    },
  },
  {
    id: "B-3",
    data: { label: "Child 3" },
    position: { x: 100, y: 90 },
    parentId: "B",
    extent: "parent",
    draggable: false,
    style: {
      width: 60,
    },
  },
  {
    id: "C",
    type: "output",
    position: { x: 100, y: 200 },
    data: { label: "Node C" },
  },
];

const initialEdges: Edge[] = [
  { id: "a1-a2", source: "A-1", target: "A-2" },
  { id: "a2-b", source: "A-2", target: "B" },
  { id: "a2-c", source: "A-2", target: "C" },
  { id: "b1-b2", source: "B-1", target: "B-2" },
  { id: "b1-b3", source: "B-1", target: "B-3" },
];

export default function SubFlows() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
