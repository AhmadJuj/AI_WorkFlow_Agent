import { NextResponse } from "next/server";
import { Client } from "@upstash/workflow";
const client = new Client({
  baseUrl: process.env.QSTASH_BASE_URL,
  token: process.env.QSTASH_TOKEN!
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const { workflowRunId } = await client.trigger({
  url: "http://localhost:3000/api/workflow",
  retries: 3
});

export async function POST(request: Request) {
  const { messages, workflowId } = await request.json();
  
  try {
    const { workflowRunId } = await client.trigger({
      url: `${BASE_URL}/api/workflow/chat`,
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