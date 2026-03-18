"use client";

import { useChat } from "@ai-sdk/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Check, PlusIcon, SparkleIcon, XIcon } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInputMessage, PromptInput, PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { createWorkflowTransport } from "@/lib/workflow/transport";
import { getNodeConfig, NodeType } from "@/lib/workflow/node-config";
import { TextShimmerLoader, TypingLoader } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";

type NodeDataType = {
  id: string;
  nodeType: NodeType;
  nodeName: string;
  status: "loading" | "error" | "complete";
  type:
  | "text-delta"
  | "tool-call"
  | "tool-result";
  toolCall?: { name: string };
  toolResult?: { name: string; result: any };

  output?: any;
  error?: any;
};

const ChatPanel = ({ workflowId }: { workflowId: string }) => {
  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(null);

  const { messages, sendMessage, status, stop } = useChat({
    ...(chatId ? { id: chatId } : {}),
    transport: createWorkflowTransport({ workflowId }),
  });

  const lastMessage = messages[messages.length - 1];
  const stringOutput = lastMessage?.role === "assistant" && lastMessage?.parts?.some(
    (part) => part.type === "text" && Boolean(part.text)
  );
  
  const isLoading =
    status === "submitted" ||
    (status === "streaming" && !stringOutput);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim()) return;
    sendMessage({
      text: message.text,
      files: message.files,
    });
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background overflow-hidden">
      <div className="bg-linear-to-br from-primary via-primary/90 to-primary/80 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between text-white">
          <p className="text-lg font-bold">Workflow Preview</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatId(crypto.randomUUID())}
          >
            New chat <PlusIcon size={14} />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {messages.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <Conversation className="h-full">
              <ConversationContent className="mt-6 px-4 pb-4">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    id={message.id}
                  >
                    <MessageContent className="text-[14.5px]">
                      {(() => {
                        // Collect workflow node data from parts and deduplicate by node id (keep latest)
                        const nodeDataMap = new Map<string, NodeDataType>();
                        const textParts: { text: string; index: number }[] = [];

                        // From message parts (custom part types)
                        message.parts?.forEach((part: any, index: number) => {
                          if (part.type === "text") {
                            textParts.push({ text: part.text, index });
                          } else if (
                            part.type === "data-workflow-node" ||
                            part.type === "data-workflow-Node"
                          ) {
                            const d = part.data as NodeDataType;
                            if (d?.id) nodeDataMap.set(d.id, d);
                          }
                        });

                        // From message data (annotations array)
                        ((message as any).data as NodeDataType[] | undefined)?.forEach((d) => {
                          if (d?.id) nodeDataMap.set(d.id, d);
                        });

                        const nodes = Array.from(nodeDataMap.values());

                        return (
                          <>
                            {nodes.map((nodeData) => (
                              <NodeDisplay
                                key={`${message.id}-node-${nodeData.id}`}
                                data={nodeData}
                              />
                            ))}
                            {textParts.map((tp) => (
                              <MessageResponse key={`${message.id}-text-${tp.index}`}>
                                {tp.text}
                              </MessageResponse>
                            ))}
                          </>
                        );
                      })()}
                    </MessageContent>
                  </Message>
                ))}
                {isLoading && (
                  <Message from="assistant" id="loading-message">
                    <MessageContent className="w-fit">
                      <TypingLoader size="sm" className="mt-1 mb-1 p-1" />
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Empty className="border-0">
              <EmptyMedia variant="icon">
                <SparkleIcon size={20} className="text-primary" />
              </EmptyMedia>
              <EmptyTitle>Preview your workflow</EmptyTitle>
              <EmptyDescription>
                Write a prompt as if you&apos;re the user to test your workflow
              </EmptyDescription>
            </Empty>
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t bg-background p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              placeholder="Send a message..."
              className="pt-3"
              onChange={(e) => setInput(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputFooter className="flex justify-end p-2 pt-0">
            <PromptInputSubmit
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-primary! text-primary-foreground"
              onStop={stop}
              status={status}
            >
              <ArrowUp size={16} />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

type NodeDisplayType = {
  data: NodeDataType;
};

export const NodeDisplay = ({ data }: NodeDisplayType) => {
  const nodeConfig = getNodeConfig(data.nodeType);
  if (!nodeConfig) return null;

  const NodeIcon = nodeConfig.icon;
  const { status, output, error, toolCall, toolResult } = data;

  return (
    <div className="my-2">
      {/* Node header: icon + name */}
      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <Spinner className="h-4 w-4" />
        ) : status === "error" ? (
          <XIcon className="h-4 w-4 text-destructive" />
        ) : (
          <NodeIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold">{data.nodeName}</span>
      </div>

      {/* Tool calls */}
      {(toolCall || toolResult) && (
        <div className="ml-6 mt-1 px-3 border-l-2 border-border flex items-center gap-2">
          {toolResult ? (
            <>
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{toolResult.name}</span>
            </>
          ) : (
            <TextShimmerLoader />
          )}
        </div>
      )}

      {/* Node output */}
      {output && status === "complete" && (
        <div className="ml-6 mt-1">
          {typeof output === "string" ? (
            <MessageResponse>{output}</MessageResponse>
          ) : (
            <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(output, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Loading shimmer for in-progress nodes */}
      {status === "loading" && (
        <div className="ml-6 mt-1">
          <TextShimmerLoader />
        </div>
      )}

      {/* Error display */}
      {status === "error" && (
        <div className="ml-6 mt-1 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}
    </div>
  );
};

export default ChatPanel;