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
    responsesSchema,
    model: selectedModel,
    selectedTools = [],
  } = node.data as any;

  const replaceInstructions = replaceVariables(instructions, outputs);

  const hasSchema = responsesSchema && Object.keys(responsesSchema.properties || {}).length > 0;
  
  const jsonOutput = outputFormat === "json" && hasSchema ? {
    output: Output.object({
      schema: convertJsonSchemaToZod(responsesSchema),
    }),
  } : undefined;

  // Helper to build JSON fallback instructions when model doesn't support structured output
  const buildJsonFallbackInstructions = () => {
    if (!hasSchema) return replaceInstructions;
    const schemaStr = JSON.stringify(responsesSchema, null, 2);
    return `${replaceInstructions}\n\nIMPORTANT: You MUST respond with valid JSON only, no extra text. Follow this exact JSON schema:\n${schemaStr}`;
  };

  // Try with structured output first
  let result = await streamAgentAction({
    model: selectedModel,
    instructions: replaceInstructions,
    history,
    jsonOutput,
    selectedTools,
  });

  let fullText = "";
  let streamError = false;

  try {
    for await (const chunk of result.fullStream) {
      switch (chunk.type) {
        case "text-delta":
          fullText += chunk.text;
          await channel.emit("workflow.chunk", {
            type: "data-workflow-node",
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
            type: "data-workflow-node",
            id: node.id,
            data: {
              id: node.id,
              nodeType: node.type,
              nodeName: node.data.label,
              status: "loading",
              type: "tool-call",
              toolCall: {
                name: chunk.toolName,
              },
            },
          });
          break;
         case "tool-result":
          await channel.emit("workflow.chunk", {
            type: "data-workflow-node",
            id: node.id,
            data: {
              id: node.id,
              nodeType: node.type,
              nodeName: node.data.label,
              status: "loading",
              type: "tool-result",
              output: fullText,
              toolResult: {
                toolCallId: chunk.toolCallId,
                name: chunk.toolName,
                result: chunk.output,
              },
            },
          });
          break;

        default:
          break;
      }
    }
  } catch (error: any) {
    console.log("[AGENT] Stream error (model may not support json_schema):", error?.message || error);
    streamError = true;
  }

  if (outputFormat === "json") {
    console.log("[AGENT] responsesSchema:", JSON.stringify(responsesSchema));
    console.log("[AGENT] jsonOutput:", !!jsonOutput);

    // Try result.object first (structured output)
    if (jsonOutput && !streamError) {
      try {
        const obj = await (result as any).object;
        if (obj !== undefined && obj !== null) {
          return { output: obj };
        }
      } catch (e) {
        console.log("[AGENT] result.object failed:", e);
      }
    }

    // If structured output failed (model doesn't support it), retry without it
    if (streamError || fullText.trim() === "") {
      console.log("[AGENT] Retrying without structured output, using prompt-based JSON...");
      
      result = await streamAgentAction({
        model: selectedModel,
        instructions: buildJsonFallbackInstructions(),
        history,
        jsonOutput: undefined,
        selectedTools,
      });

      fullText = "";
      for await (const chunk of result.fullStream) {
        if (chunk.type === "text-delta") {
          fullText += chunk.text;
          await channel.emit("workflow.chunk", {
            type: "data-workflow-node",
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
        }
      }
    }

    // Parse the text as JSON
    const trimmed = fullText.trim();
    console.log("[AGENT] Parsing JSON from text:", trimmed);
    try {
      return { output: JSON.parse(trimmed) };
    } catch {
      // If the model returned a bare string, wrap it
      return { output: { result: trimmed } };
    }
  }

  return {
    output: { text: fullText },
  };
}