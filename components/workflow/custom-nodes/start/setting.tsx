import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { CopyIcon, FileText } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const StartNodeSetting = ({ nodeId }: { nodeId: string }) => {
  const inputVariable = `${nodeId}-input`;

  const onCopy = () => {
    navigator.clipboard.writeText(`{{${inputVariable}}}`);
    toast.success("Variable copied to clipboard");
  };

  return (
    <div className="space-y-2">
      <h5 className="font-medium">Input Variable</h5>
      <InputGroup className="border-1!">
        <InputGroupAddon align="inline-start">
          <FileText className="size-4 text-muted" />
        </InputGroupAddon>
        <code
          className="flex-1 font-mono bg-muted px-2 py-1 text-sm"
        >{`{{${inputVariable}}}`}</code>
        <InputGroupButton
          variant="ghost"
          size="icon-sm"
          className="h-6"
          onClick={onCopy}
        >
          <CopyIcon className="size-4 text-muted-foreground" />
        </InputGroupButton>
      </InputGroup>
    </div>
  );
};

export default StartNodeSetting;