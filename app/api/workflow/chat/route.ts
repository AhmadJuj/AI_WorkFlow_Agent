// route.ts
import prisma from "@/lib/prisma";
import { realtime } from "@/lib/real-time";
import { executeWorkflow } from "@/lib/workflow/execute-workflow";

import { Client } from "@upstash/qstash";
import { serve } from "@upstash/workflow/nextjs";
import { Edge, Node } from "@xyflow/react";
import { UIMessage } from "ai";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const workflowRunId = searchParams.get("id");
  
  if (!workflowRunId) {
    return new Response("Missing workflow run id", { status: 400 });
  }

  const channel = realtime.channel(workflowRunId);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Initialize an assistant message so UI data/text chunks have a target message.
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "start",
            messageId: `assistant-${workflowRunId}`,
          })}\n\n`
        )
      );
      
      channel.subscribe({
        
        events: ["workflow.chunk"],
        history: true,
        onData({ event, data, channel }) {
          const finishReason =
            (data as any)?.finishReason ?? (data as any)?.reason ?? "stop";

          const streamChunk =
            (data as any)?.type === "finish"
              ? {
                  type: "finish",
                  finishReason,
                }
              : data;

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(streamChunk)}\n\n`)
          );

          if ((streamChunk as any).type === "finish") {
            controller.close();
          }
        }
      });

      req.signal.addEventListener("abort", () => {
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
      "x-accel-buffering": "no",
    }
  });
};








export const { POST } = serve(
  async (ctx) => {
    const { workflowId, messages } = ctx.requestPayload as {
      workflowId: string;
      messages: UIMessage[];
    };

    const workflowRunId = ctx.workflowRunId;
    const channel = realtime.channel(workflowRunId);
    const message = messages[messages.length - 1];
    const userInput = message.role === "user" && 
      message.parts[0].type === "text" ? message.parts[0].text : "";

    const { nodes, edges } = await ctx.run("fetch-from-database", async () => {
      const workflowData = await prisma.workflow.findUnique({
        where: {
          id: workflowId
        }
      });
      
      if (!workflowData) throw new Error("Workflow not found");
      
      const obj = JSON.parse(workflowData.flowObject);
      const nodes = obj.nodes as Node[];
      const edges = obj.edges as Edge[];
      
      return { nodes, edges };
    });

    await ctx.run("workflow-execution", async () => {
      try {
        await executeWorkflow({
          nodes,
          edges,
          userInput,
          messages,
          channel,
          workflowRunId,
        });
      } catch (error) {
        console.error("Workflow execution error:", error);
        throw error;
      }
    });
  },
  {
    qstashClient: new Client({
      token: process.env.QSTASH_TOKEN!,
      headers:{ 
        "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS_TOKEN!,
      },
    }),
  }
);