import { DefaultChatTransport } from "ai";

export const createWorkflowTransport = ({ workflowId }: { workflowId: string }) => {
  return new DefaultChatTransport({
    api: "/api/upstash/trigger",
    async prepareSendMessagesRequest({ messages }) {
      return {
        body: {
          messages,
          workflowId
        }
      };
    },
    prepareReconnectToStreamRequest: (data) => {
      return {
        ...data,
        headers: {
          ...data.headers,
          "x-is-reconnect": "true"
        }
      };
    },
    fetch: async (input, init) => {
      const triggerRes = await fetch(input, init);
      const data = await triggerRes.json();
      const workflowRunId = data?.workflowRunId;

      if (!workflowRunId) {
        return new Response("Missing workflow run id", { status: 500 });
      }

      return fetch(`/api/workflow/chat?id=${encodeURIComponent(workflowRunId)}`, {
        method: "GET",
      });
    }
  });
};