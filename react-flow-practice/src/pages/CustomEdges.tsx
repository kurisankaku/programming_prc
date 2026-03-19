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
  useReactFlow,
  EdgeLabelRenderer,
} from "@xyflow/react";

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
}: GetStraightPathParams & { id: string }) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <button
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
        >
          delete
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

function StepEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  id: string;
}) {
  const centerY = (targetY - sourceY) / 2 + sourceY;
  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${centerY} L ${targetX} ${centerY} L ${targetX} ${targetY}`;
  return <BaseEdge id={id} path={edgePath} />;
}

function SigneEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  id: string;
}) {
  const centerX = (targetX - sourceX) / 2 + sourceX;
  const centerY = (targetY - sourceY) / 2 + sourceY;
  const edgePath = `M ${sourceX} ${sourceY}
  Q ${(targetX - sourceX) * 0.2 + sourceX} ${targetY * 1.1} ${centerX} ${centerY}
  Q ${(targetX - sourceX) * 0.8 + sourceX} ${sourceY * 0.9} ${targetX} ${targetY}`;
  return <BaseEdge id={id} path={edgePath} />;
}

const edgeTypes = {
  "custom-edge": CustomEdge,
  "step-edge": StepEdge,
  "signe-edge": SigneEdge,
};
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
  { id: "e1-3", source: "1", target: "3", type: "step-edge" },
  { id: "e2-3", source: "2", target: "3", type: "signe-edge" },
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
