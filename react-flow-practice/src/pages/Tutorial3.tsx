import { useCallback, useState } from "react";
import {
  BackgroundVariant,
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
  MiniMap,
  type GetMiniMapNodeAttribute,
  Panel,
} from "@xyflow/react";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Input Node" },
    position: { x: 250, y: 25 },
    style: { backgroundColor: "#6ede87", color: "white" },
  },

  {
    id: "2",
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
    style: { backgroundColor: "#ff0072", color: "white" },
  },
  {
    id: "3",
    type: "output",
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
    style: { backgroundColor: "#6865A5", color: "white" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3", animated: true },
];

const nodeColor: GetMiniMapNodeAttribute<Node> = (node) => {
  switch (node.type) {
    case "input":
      return "#6ede87";
    case "output":
      return "#6865A5";
    default:
      return "#ff0072";
  }
};

export default function Tutorial3() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [variant, setVariant] = useState<BackgroundVariant>(
    BackgroundVariant.Cross,
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
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
        panOnScroll
        selectionOnDrag
        panOnDrag={[]}
        selectionMode={SelectionMode.Partial}
      >
        <Background variant={variant} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable nodeColor={nodeColor} />
        <Panel position="top-left">
          <div>variant: {variant}</div>
          <button
            onClick={() => setVariant(BackgroundVariant.Dots)}
            className="m-1 p-1 bg-white border rounded"
          >
            Dots
          </button>
          <button
            onClick={() => setVariant(BackgroundVariant.Cross)}
            className="m-1 p-1 bg-white border rounded"
          >
            Cross
          </button>
          <button
            onClick={() => setVariant(BackgroundVariant.Lines)}
            className="m-1 p-1 bg-white border rounded"
          >
            Lines
          </button>
        </Panel>
        <Panel position="top-right">
          <div>Try changing the background variant!</div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
