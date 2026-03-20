import { streamAgentAction } from "@/app/actions/agent";
import { replaceVariables } from "@/lib/helper";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { Node } from "@xyflow/react";
import { Output } from "ai";
import { convertJsonSchemaToZod } from "zod-from-json-schema";

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function summarizeProjects(projects: any[]): string {
  if (projects.length === 0) {
    return "No Supabase projects found.";
  }

  const lines = projects.map((project, index) => {
    const name = project?.name || project?.ref || project?.id || "Unnamed project";
    const refOrId = project?.ref || project?.id || "n/a";
    const region = project?.region ? ` - ${project.region}` : "";
    const status = project?.status ? ` - ${project.status}` : "";
    return `${index + 1}. ${name} (${refOrId})${region}${status}`;
  });

  return `Found ${projects.length} Supabase project${projects.length === 1 ? "" : "s"}:\n${lines.join("\n")}`;
}

function summarizeWebSearchResults(rawResults: any): string | null {
  const results = Array.isArray(rawResults)
    ? rawResults
    : rawResults && typeof rawResults === "object"
      ? [rawResults]
      : [];

  if (results.length === 0) {
    return null;
  }

  const top = results.slice(0, 5);
  const lines = top.map((item: any, index: number) => {
    const title = item?.title || item?.url || item?.id || `Result ${index + 1}`;
    const date = item?.publishedDate ? ` (${String(item.publishedDate).slice(0, 10)})` : "";

    const rawSnippet = typeof item?.text === "string" ? item.text.replace(/\s+/g, " ").trim() : "";
    const snippet = rawSnippet
      ? rawSnippet.length > 260
        ? `${rawSnippet.slice(0, 260)}...`
        : rawSnippet
      : "No summary available.";

    return `${index + 1}. ${title}${date}\n   ${snippet}`;
  });

  const totalText = results.length > top.length ? `\n\nShowing top ${top.length} of ${results.length} results.` : "";
  return `Latest findings from web search:\n${lines.join("\n\n")}${totalText}`;
}

function extractReadableToolText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = safeJsonParse(trimmed);
    if (parsed !== null) {
      const parsedText = extractReadableToolText(parsed);
      if (parsedText) {
        return parsedText;
      }
    }

    return trimmed;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const obj = value as Record<string, any>;

  if (Array.isArray(obj.projects)) {
    return summarizeProjects(obj.projects);
  }

  if (obj.data && Array.isArray(obj.data.projects)) {
    return summarizeProjects(obj.data.projects);
  }

  if (obj.resolvedSearchType && obj.results) {
    const summarized = summarizeWebSearchResults(obj.results);
    if (summarized) {
      return summarized;
    }
  }

  if (Array.isArray(obj.content)) {
    const textParts = obj.content
      .map((part: any) => (typeof part?.text === "string" ? part.text.trim() : ""))
      .filter(Boolean);

    if (textParts.length > 0) {
      const joined = textParts.join("\n");
      const parsed = safeJsonParse(joined);
      if (parsed !== null) {
        const parsedText = extractReadableToolText(parsed);
        if (parsedText) {
          return parsedText;
        }
      }
      return joined;
    }
  }

  if (obj.result !== undefined) {
    const resultText = extractReadableToolText(obj.result);
    if (resultText) {
      return resultText;
    }
  }

  return JSON.stringify(obj, null, 2);
}

function toPreviewText(value: unknown, maxChars = 1200): string {
  const readable = extractReadableToolText(value);
  const text = (readable ?? "").trim();

  if (!text) {
    return "Tool returned data.";
  }

  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}\n\n...[truncated ${text.length - maxChars} chars]`;
}

export async function executeAgentNode(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs, channel, history } = context;
  const nodeData = node.data as any;
  const {
    instructions,
    outputFormat = "text",
    responsesSchema,
    model: selectedModel,
    maxOutputTokens,
  } = nodeData;

  // Current node schema stores tool selection under `tools`.
  // Keep a fallback to `selectedTools` for older saved workflows.
  const selectedTools = nodeData.tools ?? nodeData.selectedTools ?? [];

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
    maxOutputTokens,
  });

  let fullText = "";
  let streamError = false;
  let toolCallCount = 0;
  let lastToolResult: unknown = undefined;

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
              output: chunk.text,
            },
          });
          break;

        case "tool-call":
          toolCallCount += 1;
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
          lastToolResult = chunk.output;
          await channel.emit("workflow.chunk", {
            type: "data-workflow-node",
            id: node.id,
            data: {
              id: node.id,
              nodeType: node.type,
              nodeName: node.data.label,
              status: "loading",
              type: "tool-result",
              toolResult: {
                toolCallId: chunk.toolCallId,
                name: chunk.toolName,
                result: toPreviewText(chunk.output),
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
        maxOutputTokens,
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

  if (!fullText.trim()) {
    // Some model/provider combinations produce tool-call/tool-result events but no final text-delta.
    // Fall back to the SDK's aggregated text or the last tool output to avoid blank responses.
    try {
      const aggregatedText = await (result as any).text;
      if (typeof aggregatedText === "string" && aggregatedText.trim()) {
        fullText = extractReadableToolText(aggregatedText) ?? aggregatedText;
      }
    } catch {
      // Ignore and continue to tool-result fallback.
    }

    if (!fullText.trim() && lastToolResult !== undefined) {
      fullText = extractReadableToolText(lastToolResult) ?? "";
    }

    if (!fullText.trim() && toolCallCount > 0) {
      fullText = "Tools were invoked, but the model did not return a final text response.";
    }
  }

  return {
    output: { text: fullText },
  };
}