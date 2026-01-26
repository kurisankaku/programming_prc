import { useCallback, useEffect, useState } from "react";
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
  Panel,
  Handle,
  Position,
} from "@xyflow/react";

function TextUpdaterNode({
  data,
}: {
  data: {
    value: string;
    onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  };
}) {
  return (
    <div className="relative border border-[#eee] p-1 rounded-b-sm bg-white">
      <label htmlFor="text" className="text-black block">
        Text:
      </label>
      <input
        id="text"
        type="text"
        name="text"
        placeholder="Type something"
        className="text-black border border-gray-500 p-1 rounded-sm"
        onChange={data.onChange}
        value={data.value}
      />
      <Handle id="a" type="source" position={Position.Top} />
      <Handle id="b" type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { textUpdater: TextUpdaterNode };

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3", animated: true },
];

export default function CustomNodes() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [variant, setVariant] = useState<BackgroundVariant>(
    BackgroundVariant.Cross,
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
  );

  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: "1",
        type: "textUpdater",
        data: {
          value: "123",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === "1") {
                  return {
                    // ← 新しいオブジェクトを返す
                    ...node,
                    data: {
                      ...node.data,
                      value: e.target.value,
                    },
                  };
                }
                return node;
              }),
            );
          },
        },
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
    setNodes(initialNodes);
  }, [setNodes]);
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
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
