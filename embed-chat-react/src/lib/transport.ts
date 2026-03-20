import { DefaultChatTransport } from "ai";

const resolveApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_URL;

  if (typeof envBaseUrl === "string" && envBaseUrl.trim() && envBaseUrl !== "undefined") {
    return envBaseUrl.replace(/\/$/, "");
  }

  return window.location.origin;
};

export const createWorkflowTransport = ({
  workflowId,
}: {
  workflowId: string;
}) =>
  new DefaultChatTransport({
    api: `${resolveApiBaseUrl()}/api/upstash/trigger`,
    async prepareSendMessagesRequest({ messages }) {
      return {
        body: {
          workflowId,
          messages,
        },
      };
    },
    prepareReconnectToStreamRequest: (data) => {
      return {
        ...data,
        headers: { ...data.headers, "x-is-reconnect": "true" },
      };
    },
    fetch: async (input, init) => {
      const triggerRes = await fetch(input, init);
      const triggerData = await triggerRes.json();
      const workflowRunId = triggerData.workflowRunId;

      return fetch(
        `${resolveApiBaseUrl()}/api/workflow/chat?id=${workflowRunId}`,
        {
          method: "GET",
        }
      );
    },
  });
