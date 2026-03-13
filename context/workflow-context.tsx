import { createNode, NodeTypeEnum } from "@/lib/workflow/node-config";
import { Edge, Node } from "@xyflow/react";
import { createContext, useState, useContext } from "react";


export type WorkflowView = "edit" | "preview";

interface WorkflowContextType {
  view: WorkflowView;
  setView: (view: WorkflowView) => void;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
 getVariablesForNode: (nodeId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: string;
  label: string;
  outputs: string[];
}[];
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ 
  children,
  initialNodes,
  initialEdges,
  
 }: { children: React.ReactNode,
  workflowId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
 }) {
  const start_node = createNode({
    type: NodeTypeEnum.START,
  });

  const [view, setView] = useState<WorkflowView>("edit");
  const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [start_node]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

const getUpstreamNodes = (nodeId: string) => {
  const upstream = new Set<string>();

  const addToSet = (id: string) => {
    edges
      .filter((e) => e.target === id)
      .forEach((e) => {
        upstream.add(e.source);
        addToSet(e.source);
      });
  };

  addToSet(nodeId);
  return upstream;
};

const getVariablesForNode = (nodeId: string) => {
  const upstreamIds = getUpstreamNodes(nodeId);
  return nodes
    .filter((node) => upstreamIds.has(node.id))
    .map((node) => ({
      id: node.id,
      label: String(node.data.label) || "Unknown",
      outputs: (node.data.outputs as string[]) || [],
    }));
};
  return (
    <WorkflowContext.Provider
      value={{
        view,
        setView,
        nodes,
        edges,
        setNodes,
        setEdges,
        getVariablesForNode,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}