import { NextResponse } from "next/server";
import { Client } from "@upstash/workflow";

const client = new Client({
  baseUrl: process.env.QSTASH_BASE_URL,
  token: process.env.QSTASH_TOKEN!
});

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function getPublicBaseUrl(request: Request): string | null {
  const candidates = [
    process.env.QSTASH_WORKFLOW_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    candidates.push(`${proto}://${host}`);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const hostname = url.hostname.toLowerCase();
      if (LOOPBACK_HOSTS.has(hostname)) continue;
      return `${url.protocol}//${url.host}`;
    } catch {
      // Ignore malformed values and continue trying remaining candidates.
    }
  }

  return null;
}

export async function POST(request: Request) {
  const { messages, workflowId } = await request.json();

  const baseUrl = getPublicBaseUrl(request);
  if (!baseUrl) {
    return NextResponse.json(
      {
        success: false,
        error:
          "No public base URL available for QStash callback. Set QSTASH_WORKFLOW_BASE_URL (or APP_URL/NEXT_PUBLIC_APP_URL) to your deployed HTTPS domain.",
      },
      { status: 500 }
    );
  }

  try {
    const { workflowRunId } = await client.trigger({
      url: `${baseUrl}/api/workflow/chat`,
      retries: 3,
      keepTriggerConfig: true,
      headers: {
        "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS_TOKEN!,
      },
      body: {
        workflowId,
        messages
      },
    });
    
    return NextResponse.json({
      success: true,
      workflowRunId: workflowRunId
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed",
      status: 500
    });
  }
}

// json() static method of the Response interface returns a Response
// that contains the provided JSON data as body, and a content-type
// header which is set to 'application/json'.
// MDN Reference