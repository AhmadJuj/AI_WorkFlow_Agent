"use client";

import { useChat } from "@ai-sdk/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DefaultChatTransport } from "ai";
import { ArrowUp, PlusIcon, SparkleIcon } from "lucide-react";
import { ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInputMessage, PromptInput, PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

const ChatPanel = ({ workflowId }: { workflowId: string }) => {
  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(null);

  const { messages, sendMessage, status, stop } = useChat({
    id: chatId ?? undefined,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { workflowId },
    }),
  });

  const isLoading =
    status === "submitted" ||
    (status === "streaming" &&
      Boolean(
        messages[messages.length - 1]?.parts?.some(
          (part) => part.type === "text" && Boolean(part.text)
        )
      ));

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
            <div className="conversation h-full">
              <div className="conversationContent mt-6 px-4 pb-4">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    id={message.id}
                  >
                    <MessageContent className="text-[14.5px]">
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MessageResponse
                                key={`${message.id}-${index}`}
                              >
                                {part.text}
                              </MessageResponse>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
              </div>
              {isLoading ? (
                <div className="px-2">
                  <div></div>
                </div>
              ) : null}
              <ConversationScrollButton />
            </div>
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

export default ChatPanel;