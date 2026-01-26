import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type OnConnect,
  addEdge,
  SelectionMode,
  getStraightPath,
  type GetStraightPathParams,
  BaseEdge,
} from "@xyflow/react";

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
}: GetStraightPathParams & { id: string }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  console.log("edgePath:", edgePath);

  return <BaseEdge id={id} path={edgePath} />;
}

const edgeTypes = { "custom-edge": CustomEdge };

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Node 1" },
    position: { x: 150, y: 0 },
  },
  {
    id: "2",
    data: { label: "Node 2" },
    position: { x: 0, y: 150 },
  },
  {
    id: "3",
    data: { label: "Node 3" },
    position: { x: 300, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "custom-edge" },
  { id: "e1-3", source: "1", target: "3" },
];

export default function CustomEdges() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
  );
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        panOnScroll
        selectionOnDrag
        panOnDrag={[]}
        selectionMode={SelectionMode.Partial}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
