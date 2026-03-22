import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Edge, Node as ReactFlowNode } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflow-store";

type Workflow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  flowObject: string;
  createdAt: string;
  updatedAt: string;
};

type CreateWorkflowPayload = {
  name: string;
  description?: string;
};

type GetWorkType = {
  name: string;
  flowObject: any;
  id: string;
};

type WorkflowFlowObject = {
  nodes: ReactFlowNode[];
  edges: Edge[];
};

type WorkflowType = {
  id: string;
  name: string;
  flowObject: string | WorkflowFlowObject;
};

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError && typeof error.response?.data?.error === "string") {
    return error.response.data.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const parseFlowObject = (
  flowObject: WorkflowType["flowObject"]
): WorkflowFlowObject => {
  if (typeof flowObject === "string") {
    return JSON.parse(flowObject) as WorkflowFlowObject;
  }

  return flowObject;
};

export const useGetWorkflows = () => {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () =>
      await axios
        .get<{ data: Workflow[] }>("/api/workflow")
        .then((res) => res.data.data),
    retry: false,
    throwOnError: false,
  });
};

export const useCreateWorkflow = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ name, description }: CreateWorkflowPayload) =>
      axios
        .post("/api/workflow", {
          name,
          description,
        })
        .then((res) => res.data),

    onSuccess: (data) => {
      toast.success("Workflow created successfully");
      router.push(`/workflow/${data.data.id}`);
    },

    onError: (error) => {
      console.log(error);
      toast.error(getAxiosErrorMessage(error, "Failed to create workflow"));
    },
  });
};

export const useGetWorkflowById = (workflowId: string) => {
  const { setSavedState } = useWorkflowStore();
  
  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const res = await axios
        .get<{ data: WorkflowType }>(`/api/workflow/${workflowId}`)
        .then((res) => {
          const result = res.data.data;
          const flowObject = parseFlowObject(result.flowObject);

          setSavedState(flowObject.nodes, flowObject.edges);
          return {
            ...result,
            flowObject,
          };
        });
      return res;
    },
    enabled: !!workflowId,
  });
};

export const useUpdateWorkflow = (workflowId: string) => {
  const { setSavedState } = useWorkflowStore();
  
  return useMutation({
    mutationFn: async (data: { nodes: ReactFlowNode[]; edges: Edge[] }) =>
      await axios
        .put<{ data: WorkflowType }>(`/api/workflow/${workflowId}`, data)
        .then((res) => res.data),
    onSuccess: (data) => {
      const result = data.data;
      const flowObject = parseFlowObject(result.flowObject);

      setSavedState(flowObject.nodes, flowObject.edges);
      toast.success("Workflow updated successfully");
    },
    onError: (error) => {
      console.log("Update workflow failed", error);
      const message =
        error instanceof AxiosError && typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Failed to update workflow";

      toast.error(message);
    },
  });
};