
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { Node } from "@xyflow/react";

export async function executeStartNode(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  return {
    output: {
      input: context.outputs[node.id]?.input || ""
    }
  };
}