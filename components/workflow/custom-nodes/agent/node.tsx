import { NodeProps } from "@xyflow/react";
import React from "react";
import WorkflowNode from "../../workflow-node";
import { MousePointer2Icon, PlayIcon } from "lucide-react";


const AgentNode = (props: NodeProps) => {
  const { id, data, selected } = props;
  const bgColor = data?.color as string;
  
  const label = data?.label as string || "Agent";
  return (
    <>
      <WorkflowNode
        nodeId={id}
        label={label}
        subText="Agent"
        icon={MousePointer2Icon}
        className="min-w-28!"
       
        selected={selected}
        handles={{
          target: true,
          source: true,
        }}
        color={bgColor}
        settingTitle={`${label} Settings`}
        settingDescription="Call the model with instructions and tools"
        settingComponent={ <></>}
      />
    </>
  );
};
export default AgentNode;