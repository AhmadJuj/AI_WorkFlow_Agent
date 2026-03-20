import { Node, Edge } from "@xyflow/react";
import { UIMessage } from "ai";
import TopologicalSort from "topological-sort";
import { getNodeExecutor, NodeType, NodeTypeEnum } from "./node-config";
import { ExecutorContextType } from "@/types/workflow";

const STREAM_TEXT_CHUNK_SIZE = 1800;
const NODE_OUTPUT_PREVIEW_LIMIT = 8000;

function chunkText(text: string, chunkSize = STREAM_TEXT_CHUNK_SIZE): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function toNodeOutputPreview(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  if (value.length <= NODE_OUTPUT_PREVIEW_LIMIT) {
    return value;
  }

  return `${value.slice(0, NODE_OUTPUT_PREVIEW_LIMIT)}\n\n...[truncated ${value.length - NODE_OUTPUT_PREVIEW_LIMIT} chars]`;
}


export function topologicalSort(nodes: Node[], edges: Edge[]) {
  const ts = new TopologicalSort(new Map());
  const excludedNodes: NodeType[] = [NodeTypeEnum.COMMENT];

  nodes.forEach((node) => {
    ts.addNode(node.id, node);
  });

  edges.forEach((edge) => {
    ts.addEdge(edge.source, edge.target);
  });

  // Deduplicate and add edges
  // const seenEdges = new Set<string>();
  // edges.forEach((edge) => {
  //   const key = `${edge.source}->${edge.target}`;
  //   if (!seenEdges.has(key)) {
  //     seenEdges.add(key);
  //     ts.addEdge(edge.source, edge.target);
  //   }
  // });

  try {
    const sortedMap = ts.sort();
    const sortedIds = Array.from(sortedMap.keys());
    return sortedIds
      .map((id) => nodes.find((node) => node.id === id)!)
      .filter(
        (node) =>
          node.type !== undefined &&
          !excludedNodes.includes(node.type as NodeType)
      );
  } catch (error: any) {
    throw new Error(
      "Workflow contains a cycle or invalid dependencies. Cannot execute.",
      { cause: error }
    );
  }
}


export function getNextNodes(
  currentNodeId: string,
  edges: Edge[],
  context: ExecutorContextType
) {
  const outgoingEdges = edges.filter(
    (edge) => edge.source === currentNodeId);

  if (outgoingEdges.length === 0) return [];

  const currentOutput = context.outputs[currentNodeId];

  if (currentOutput?.selectedBranch) {
    const branchEdge = outgoingEdges.find(
      (edge) => edge.sourceHandle === currentOutput.selectedBranch);
    return branchEdge ? [branchEdge.target] : [];
  }

  return outgoingEdges.map((edge) => edge.target);
}


export async function executeWorkflow(
  {
    nodes,
    edges,
    userInput,
    messages,
    channel,
    workflowRunId,
  }: {
    nodes: Node[];
    edges: Edge[];
    userInput: string;
    messages: UIMessage[];
    channel: any;
    workflowRunId: string;
  }
) {

  const startNode = nodes.find(node => node.type === NodeTypeEnum.START);
  if (!startNode) throw new Error("Start node not found in the workflow");

  const context: ExecutorContextType = {
    outputs: {
      [startNode.id]: { input: userInput }, //{{startId.input}}
    },
    history: messages || [],
    workflowRunId,
    channel,
  }


  const sortedNodes = topologicalSort(nodes, edges);
  console.log("Execution history:", JSON.stringify(messages, null, 2));


  const nodesToExecute = new Set<string>([startNode.id]);

  for (const node of sortedNodes) {

    if (!nodesToExecute.has(node.id)) {
      continue; // Skip nodes that are not ready for execution
    }
    const nodeType = node.type as NodeType;
    console.log(`[EXEC] Running node ${node.id} (${nodeType})`);
    const executor = await getNodeExecutor(nodeType);
    //Emit loading to client
    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      id: node.id,
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data.label,
        status: "loading",
      }
    })

    try {
      console.log(`[EXEC] Before executor for ${node.id}`);
      const result = await executor(node, context);
      console.log(`[EXEC] After executor for ${node.id}, result:`, result);

      // Emit plain assistant text chunks so useChat can render agent replies in the chat UI.
      if (node.type === NodeTypeEnum.AGENT && typeof result.output?.text === "string" && result.output.text.trim()) {
        const textPartId = `agent-text-${node.id}`;
        await channel.emit("workflow.chunk", {
          type: "text-start",
          id: textPartId,
        });
        const textChunks = chunkText(result.output.text);
        for (const textChunk of textChunks) {
          await channel.emit("workflow.chunk", {
            type: "text-delta",
            id: textPartId,
            delta: textChunk,
          });
        }
        await channel.emit("workflow.chunk", {
          type: "text-end",
          id: textPartId,
        });
      }

      const resolvedOutput = result.output?.text || result.output;

      await channel.emit("workflow.chunk", {
        type: "data-workflow-node",
        id: node.id,
        data: {
          id: node.id,
          nodeType: node.type,
          nodeName: node.data.label,
          status: "complete",
          output: toNodeOutputPreview(resolvedOutput),
        }
      })


      if (node.type !== NodeTypeEnum.START) {
        const outputResult = node.type === NodeTypeEnum.AGENT
          ? result : result.output
        context.outputs[node.id] = outputResult;
      }

      if (node.type === NodeTypeEnum.END) {
        console.log("Workflow execution completed.");
        await channel.emit("workflow.chunk", {
          type: "finish",
          finishReason: "stop"
        })
        return {
          success: true,
          output: context.outputs,
        }
      }

      const nextNodeIds = getNextNodes(node.id, edges, context);

      if (nextNodeIds.length === 0) {
        await channel.emit("workflow.chunk", {
          type: "finish",
          finishReason: "stop"
        })
        return {
          success: true,
          output: "Workflow stopped. No next nodes to execute.",
        }
      }


      nextNodeIds.forEach((id) => nodesToExecute.add(id));

    } catch (error) {
      await channel.emit("workflow.chunk", {
        type: "data-workflow-node",
        id: node.id,
        data: {
          id: node.id,
          nodeType: node.type,
          nodeName: node.data?.label,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;

    }

  }

  await channel.emit("workflow.chunk", {
    type: "finish",
    finishReason: "stop",
  });

  return {
    success: true,
    output: context.outputs,
  }

}