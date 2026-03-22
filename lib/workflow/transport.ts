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

      let data: { workflowRunId?: string; error?: string; success?: boolean } | null = null;
      try {
        data = await triggerRes.json();
      } catch {
        if (!triggerRes.ok) {
          throw new Error(`Failed to trigger workflow: ${triggerRes.status}`);
        }
      }

      if (!triggerRes.ok) {
        throw new Error(data?.error || `Failed to trigger workflow: ${triggerRes.status}`);
      }

      const workflowRunId = data?.workflowRunId;

      if (!workflowRunId) {
        throw new Error(data?.error || "Missing workflow run id");
      }

      return fetch(`/api/workflow/chat?id=${encodeURIComponent(workflowRunId)}`, {
        method: "GET",
      });
    }
  });
};