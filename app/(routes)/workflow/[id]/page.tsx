"use client";

import { useGetWorkflowById } from "@/features/use-workflow";
import { useParams } from "next/navigation";
import Header from "./_common/header";
import { Spinner } from "@/components/ui/spinner";
import { WorkflowProvider } from "@/context/workflow-context";
import WorkflowCanvas from "./_common/workflow-canvas";
import { ReactFlowProvider } from "@xyflow/react";

const Page = () => {
  const params = useParams();
  const id = params.id as string;
  const { data: workflow, isPending } = useGetWorkflowById(id);

  if (!workflow && !isPending) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">

<ReactFlowProvider>

        <WorkflowProvider>

      <div className="flex flex-col h-screen relative">
        <Header name={workflow?.name} workflowId={workflow?.id} />
        <div className="flex-1 relative overflow-hidden">
          {isPending ? (
              <div className="flex items-center justify-center h-full">
              <Spinner className="size-12 text-primary" />
            </div>
          ) : (
              <WorkflowCanvas/>
            )}
        </div>
      </div>
            </WorkflowProvider>
            </ReactFlowProvider>
    </div>
  );
};

export default Page;