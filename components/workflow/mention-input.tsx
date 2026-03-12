"use client";

import React, { useMemo, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { cn } from "@/lib/utils";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BracesIcon } from "lucide-react";
import { useWorkflow } from "@/context/workflow-context";

type Suggestion = {
  id: string;
  display: string;
};

type PropsType = {
  nodeId: string;
  value: string;
  placeholder?: string;
  size?: string;
  className?: string;
  multiline?: boolean;
  showTriggerButton?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

const MentionInput = ({
  nodeId,
  value,
  placeholder = "Type {{ to insert variables",
  className,
  multiline = false,
  showTriggerButton = true,
  onChange,
  onBlur,
}: PropsType) => {
  const [open, setOpen] = useState(false);

  const { getVariablesForNode } = useWorkflow();
  const rightPadding = showTriggerButton ? 36 : 8;
  const inputPadding = multiline
    ? `8px ${rightPadding}px 8px 8px`
    : `6px ${rightPadding}px 6px 8px`;

  const suggestions: Suggestion[] = useMemo(() => {
    if (!nodeId) return [];

    const availableNodes = getVariablesForNode(nodeId);
    const result: Suggestion[] = [];

    availableNodes.forEach((node) => {
      node.outputs?.forEach((output: string) => {
        result.push({
          id: `${node.id}.${output}`,
          display: `${node.label}.${output}`,
        });
      });
    });

    return result;
  }, [getVariablesForNode, nodeId]);

//   const mentionsStyle: any = {
//   control: {
//     backgroundColor: "transparent",
//     fontSize: 14,
//     lineHeight: "20px",
//     fontFamily: "inherit",
//     border: "none",
//   },

//   highlighter: {
//     padding: "8px",
//     minHeight: 120,
//     maxHeight: 200,
//     overflowY: "auto",
//     boxSizing: "border-box",
//     whiteSpace: "pre-wrap",
//     wordWrap: "break-word",
//     fontSize: 14,
//     lineHeight: "20px",
//     fontFamily: "inherit",
//   },

//   input: {
//     padding: "8px",
//     minHeight: 120,
//     maxHeight: 200,
//     overflowY: "auto",
//     boxSizing: "border-box",
//     border: "none",
//     outline: "none",
//     resize: "none",
//     backgroundColor: "transparent",
//     color: "inherit",
//     whiteSpace: "pre-wrap",
//     wordWrap: "break-word",
//     fontSize: 14,
//     lineHeight: "20px",
//     fontFamily: "inherit",
//   },
// };

  const mentionsStyle: any = {
    control: {
      backgroundColor: "transparent",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
      border: "none",
      width: "100%",
      minHeight: multiline ? 120 : 36,
    },

    highlighter: {
      padding: inputPadding,
      minHeight: multiline ? 120 : 36,
      maxHeight: multiline ? 200 : undefined,
      overflowY: multiline ? "auto" : "hidden",
      boxSizing: "border-box",
      whiteSpace: multiline ? "pre-wrap" : "nowrap",
      wordWrap: multiline ? "break-word" : "normal",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
    },

    input: {
      padding: inputPadding,
      height: multiline ? undefined : 36,
      minHeight: multiline ? 120 : 36,
      width: "100%",
      overflowY: multiline ? "auto" : "hidden",
      boxSizing: "border-box",
      border: "none",
      outline: "none",
      resize: multiline ? "none" : undefined,
      backgroundColor: "transparent",
      color: "inherit",
      whiteSpace: multiline ? "pre-wrap" : "nowrap",
      wordWrap: multiline ? "break-word" : "normal",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
    },
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-md border border-input bg-background text-sm text-foreground",
        className
      )}
    >
      <MentionsInput
        value={value}
        placeholder={placeholder}
        singleLine={!multiline}
        spellCheck={false}
        style={mentionsStyle}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        customSuggestionsContainer={(children) => (
          <div className="z-[99] min-w-64 max-w-2xl rounded-lg border shadow-lg left-0">
            <Command>
              <CommandList className="max-h-64 overflow-y-auto">
                {children}
              </CommandList>
            </Command>
          </div>
        )}
      >
        <Mention
          trigger="{{"
          data={suggestions}
          markup="{{__id__}}"
          displayTransform={(id) => `{{${id}}}`}
          appendSpaceOnAdd
          className="bg-primary/20"
          renderSuggestion={(entry, _search, _highlighted, _index, focused) => (
            <CommandItem
              value={entry.display}
              className={cn(
                "flex justify-between text-sm",
                focused && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex flex-1 items-start gap-2">
                <span>{entry.display}</span>
              </div>
            </CommandItem>
          )}
        />
      </MentionsInput>

      {showTriggerButton && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "absolute h-6 w-6",
                multiline
                  ? "right-2 bottom-2"
                  : "right-2 top-1/2 -translate-y-1/2"
              )}
            >
              <BracesIcon className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="min-w-64 p-0 z-50 max-w-2xl"
            side="bottom"
            sideOffset={6}
            align="end"
            >
            <Command>
              <CommandInput placeholder="Search for variable..." />
              <CommandList className="max-h-64 overflow-y-auto p-2">
                {suggestions.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.display}
                    className="text-sm"
                    onSelect={() => {
                      onChange(value + `{{${item.id}}}`);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-1 items-start gap-2">
                      <span>{item.display}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default MentionInput;