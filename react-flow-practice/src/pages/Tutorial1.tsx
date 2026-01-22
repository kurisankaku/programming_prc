import { ReactFlow, Background, Controls } from "@xyflow/react";

export default function Tutorial1() {
  return (
    <div className="w-full h-full">
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
