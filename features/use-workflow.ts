import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Workflow } from "@/lib/generated/prisma/client"

type CreateWorkflowPayload = {
  name: string;
  description?: string;
};

type GetWorkType = {
  name: string;
  flowObject: any;
  id: string;
};

export const useGetWorkflows = () => {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () =>
      await axios
        .get<{ data: Workflow[] }>("/api/workflow")
        .then((res) => res.data.data),
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
      toast.error("Failed to create workflow");
    },
  });
};

export const useGetWorkflowById = (workflowId: string) => {
  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () =>
      await axios
        .get<{ data: GetWorkType }>(`/api/workflow/${workflowId}`)
        .then((res) => res.data.data),
    enabled: !!workflowId,
  });
};