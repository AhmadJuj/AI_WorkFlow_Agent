import { Node, Edge } from "@xyflow/react";
import { UIMessage } from "ai";
import { TopologicalSort } from "topological-sort";


import { ExecutorContextType } from "@/types/workflow";
import { NodeType, NodeTypeEnum } from "./node-config";

export function topologicalSort(nodes: Node[], edges: Edge[]) {
  const ts = new TopologicalSort(new Map());
  const excludedNodes: NodeType[] = [NodeTypeEnum.COMMENT];

  nodes.forEach((node) => {
    ts.addNode(node.id, node);
  });

  edges.forEach((edge) => {
    ts.addEdge(edge.source, edge.target);
  });

  try {
    const sortedMap = ts.sort();
    const sortedIds = Array.from(sortedMap.keys());
    return sortedIds
      .map((id) => nodes.find((node) => node.id === id))
      .filter(
        (node) => node?.type !== undefined &&
        !excludedNodes.includes(node.type as NodeType)
      );
  } catch (error) {
    throw new Error(
      "Workflow contains a cycle or invalid dependencies. Cannot execute.",
      { cause: error }
    );
  }
}

export async function executeWorkflow({
  nodes,
  edges,
  userInput,
  messages,
  channel,
  workflowRunId
}: {
  nodes: Node[];
  edges: Edge[];
  userInput: string;
  messages: UIMessage[];
  channel: any;
  workflowRunId: string;
}) {
  const startNode = nodes.find(node => node.type === NodeTypeEnum.START);
  if (!startNode) throw new Error("Start node not found in the workflow");

  const context: ExecutorContextType = {
  outputs: {
    [startNode.id]: { input: userInput }
  },
  history: messages || [],
  workflowRunId,
  channel,
};
}