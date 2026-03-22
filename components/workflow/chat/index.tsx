"use client";

import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import ChatPanel from "./chat-panel";

type ChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
};

const Chat = ({ open, onOpenChange, workflowId }: ChatProps) => {

  return (
    <Sheet
      modal={false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="z-95 w-full gap-0 overflow-hidden rounded-none bg-background p-0 sm:max-w-lg"
        overlayClass="bg-black/5! backdrop-blur-none!"
      >
        <SheetTitle className="sr-only">Workflow Preview</SheetTitle>
        <SheetDescription className="sr-only">
          Preview and chat with the current workflow.
        </SheetDescription>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ChatPanel workflowId={workflowId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Chat;