import { useMemo, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflow-store";

interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean;
  discardChanges: () => { nodes: Node[]; edges: Edge[] };
}

export function useUnsavedChanges(
  nodes: Node[] | undefined,
  edges: Edge[] | undefined
): UseUnsavedChangesReturn {
  const { savedNodes, savedEdges } = useWorkflowStore();

  const hasUnsavedChanges = useMemo(() => {
    const currentNodes = nodes ?? [];
    const currentEdges = edges ?? [];
    const baselineNodes = savedNodes ?? [];
    const baselineEdges = savedEdges ?? [];

    const nodeData = (list: Node[]) =>
      list.map((n) => ({ id: n.id, type: n.type, data: n.data }));
    
    const edgeData = (list: Edge[]) =>
      list.map((e) => ({ source: e.source, target: e.target, id: e.id }));

    return (
      JSON.stringify(nodeData(currentNodes)) !== JSON.stringify(nodeData(baselineNodes)) ||
      JSON.stringify(edgeData(currentEdges)) !== JSON.stringify(edgeData(baselineEdges))
    );
  }, [nodes, edges, savedNodes, savedEdges]);

  const discardChanges = useCallback(() => {
    return { nodes: savedNodes, edges: savedEdges };
  }, [savedNodes, savedEdges]);

  return {
    hasUnsavedChanges,
    discardChanges,
  };
}