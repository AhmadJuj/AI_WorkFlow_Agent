"use server";

import { UIMessage, convertToModelMessages, streamText, stepCountIs } from "ai";
import { webSearch } from "@exalabs/ai-sdk";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createMCPClient } from '@ai-sdk/mcp';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";

function shortId(value: string) {
  return value.length <= 8 ? value : `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function getOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return "invalid-url";
  }
}

export async function streamAgentAction({
  model,
  instructions,
  history,
  jsonOutput,
  selectedTools,
  maxOutputTokens,
}: {
  model: string;
  instructions: string;
  history: UIMessage[];
  jsonOutput?: any;
  maxOutputTokens?: number;
  selectedTools: Array<
    | { type: "native"; value: string }
    | { type: "mcp"; value: string; serverId: string; tools:{name: string} [] }
  >;
}) {
  const modelMessage = await convertToModelMessages(history);
  const tools: Record<string, any> = {};
  const mcpClients: any[] = [];
  const selectedNativeTools = selectedTools.filter((t) => t.type === "native");
  const selectedMcpTools = selectedTools.filter((t) => t.type === "mcp");

  console.log("[AGENT][TOOLS] selected", {
    nativeCount: selectedNativeTools.length,
    mcpServerCount: selectedMcpTools.length,
    mcpSelections: selectedMcpTools.map((t) => ({
      serverId: shortId(t.serverId),
      requestedTools: t.tools.map((tool) => tool.name),
    })),
  });

  // Native tools
  for (const t of selectedNativeTools) {
    if (t.value === "webSearch") {
      tools.webSearch = webSearch();
    }
  }

  for (const t of selectedMcpTools) {
    const { toolSet, mcpClient } = await getMcpToolsByServerId(t.serverId);
    mcpClients.push(mcpClient);
    const availableToolNames = Object.keys(toolSet);
    const linkedToolNames: string[] = [];
    const missingToolNames: string[] = [];

    for (const tool of t.tools) {
      if (toolSet[tool.name]) {
        tools[tool.name] = toolSet[tool.name];
        linkedToolNames.push(tool.name);
      } else {
        missingToolNames.push(tool.name);
      }
    }

    console.log("[AGENT][TOOLS] mcp-mapping", {
      serverId: shortId(t.serverId),
      requestedTools: t.tools.map((tool) => tool.name),
      availableCount: availableToolNames.length,
      linkedTools: linkedToolNames,
      missingTools: missingToolNames,
    });
  }

  const finalToolNames = Object.keys(tools);
  console.log("[AGENT][TOOLS] final-for-model", {
    count: finalToolNames.length,
    names: finalToolNames,
  });

  const toolList = Object.entries(tools)
    .map(([name]) => `- ${name}`)
    .join("\n");

  const systemPrompt = `You are a helpful assistant.
IMPORTANT: Only respond to the user's MOST RECENT message.
**Must Use the following instructions:
${instructions}
${toolList ? `**Available tools:\n${toolList}` : ""}`.trim();

  const result = await streamText({
    model: openrouter.chat(model),
    system: systemPrompt,
    messages: modelMessage,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    maxOutputTokens: maxOutputTokens ?? 4000,
    stepCount: stepCountIs(8),
    ...jsonOutput,
    onFinish: async () => {
      console.log("[AGENT][TOOLS] closing-mcp-clients", { count: mcpClients.length });
      for (const client of mcpClients) {
        await client.close();
      }
    }
  });

  return result;
}

export async function connectMcpServer({
  url,
  apiKey,
}: {
  url: string;
  apiKey: string;
}) {
  if (!url || !apiKey) {
    throw new Error("URL and API Key are required to connect to MCP server.");
  }

  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) throw new Error("Unauthorized");


  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: apiKey ? {
        Authorization: `Bearer ${apiKey}`
      } : undefined
    },
  });

  const toolSet = await mcpClient.tools();
  const toolsArray = Object.entries(toolSet)
    .map(([name, tool]) => ({
      name,
      description: tool.description ?? "",
    }));

  await mcpClient.close();
  return { tools: toolsArray };
}
export async function addMcpServer({
  url,
  apiKey,
  label,
}: {
  url: string;
  apiKey: string;
  label: string;
}) {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) throw new Error("Unauthorized");

  let server = await prisma.mcpServer.findFirst({
    where: {
      userId: user.id,
      url,
    }
  });

  const encryptedKey = apiKey ? encrypt(apiKey) : "";

  if (!server) {
    server = await prisma.mcpServer.create({
      data: {
        userId: user.id,
        label,
        url,
        token: encryptedKey
      }
    });
  } else {
    server = await prisma.mcpServer.update({
      where: { id: server.id },
      data: {
        token: encryptedKey
      }
    });
  }

  return { serverId: server.id };
}


async function getMcpToolsByServerId(serverId: string) {
  const server = await prisma.mcpServer.findUnique({
    where: { id: serverId }
  });

  if (!server) throw new Error("MCP Server not found");

  const apiKey = server.token ? decrypt(server.token) : undefined;
  const url = server.url;

  console.log("[AGENT][MCP] connecting", {
    serverId: shortId(serverId),
    origin: getOrigin(url),
    hasApiKey: Boolean(apiKey),
  });

  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: apiKey ? {
        Authorization: `Bearer ${apiKey}`
      } : undefined
    }
  });

  const toolSet = await mcpClient.tools();
  console.log("[AGENT][MCP] fetched-tools", {
    serverId: shortId(serverId),
    count: Object.keys(toolSet).length,
    names: Object.keys(toolSet),
  });

  return { toolSet, mcpClient };
}