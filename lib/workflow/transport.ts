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
      const workflowRunId = data.workflowRunId;

      return fetch(`/api/workflow/chatid-${workflowRunId}`, {
        method: "GET",
      });
    }
  });
};