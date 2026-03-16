import { streamAgentAction } from "@/app/actions/agent";
import { replaceVariables } from "@/lib/helper";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { Node } from "@xyflow/react";
import { Output } from "ai";
import { convertJsonSchemaToZod } from "zod-from-json-schema";

export async function executeAgentNode(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs, channel, history } = context;
  const {
    instructions,
    outputFormat = "text",
    responseSchema,
    model: selectedModel,
    selectedTools = [],
  } = node.data as any;

  const replaceInstructions = replaceVariables(instructions, outputs);
  
  const jsonOutput = outputFormat === "json" && responseSchema ? {
    output: Output.object({
      schema: convertJsonSchemaToZod(responseSchema),
    }),
  } : undefined;

  const result = await streamAgentAction({
    model: selectedModel,
    instructions: replaceInstructions,
    history,
    jsonOutput,
    selectedTools,
  });

  let fullText = "";

  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        fullText += chunk.text;
        await channel.emit("workflow.chunk", {
          type: "data-workflow-Node",
          id: node.id,
          data: {
            id: node.id,
            nodeType: node.type,
            nodeName: node.data.label,
            status: "loading",
            type: "text-delta",
            output: fullText,
          },
        });
        break;

      case "tool-call":
        await channel.emit("workflow.chunk", {
          type: "data-workflow-Node",
          id: node.id,
          data: {
            id: node.id,
            nodeType: node.type,
            nodeName: node.data.label,
            status: "loading",
            type: "tool-call",
            toolName: fullText,
            tool: {
              name: chunk.toolName,
            },
          },
        });
        break;

      default:
        break;
    }
  }

  if (outputFormat === "json") {
    try {
      const text = await result.text;
      return {
        output: JSON.parse(text),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Failed to parse JSON output. " + (error as Error).message);
    }
  }

  return {
    output: { text: fullText },
  };
}