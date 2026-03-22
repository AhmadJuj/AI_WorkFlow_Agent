"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getNodeConfig, NodeType, NodeTypeEnum } from "@/lib/workflow/node-config";

type NodePanelProps = {
  onAddNode: (nodeType: NodeType) => void;
};

const NODE_LIST = [
  {
    group: "Core",
    items: [NodeTypeEnum.AGENT, NodeTypeEnum.END, NodeTypeEnum.COMMENT],
  },
  {
    group: "Logic",
    items: [NodeTypeEnum.IF_ELSE],
  },
  {
    group: "Network",
    items: [NodeTypeEnum.HTTP],
  },
] as const;

const NodePanel = ({ onAddNode }: NodePanelProps) => {
  const isMobile = useIsMobile();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={cn(
        "absolute flex flex-col rounded-lg bg-card shadow-xl z-40",
        isMobile
          ? "inset-x-2 bottom-24 left-2 right-2 border border-border/70"
          : "top-10 left-4 h-fit w-56 pb-5"
      )}
    >
      <div className={cn("flex-1", isMobile ? "p-3" : "space-y-1 p-4")}>
        {NODE_LIST.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-1 text-[11px] font-medium text-muted-foreground">
              {group.group}
            </h4>
            <div className={cn(isMobile ? "grid grid-cols-2 gap-1.5" : "space-y-1")}>
              {group.items.map((nodeType) => {
                const config = getNodeConfig(nodeType);
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <button
                    key={nodeType}
                    draggable={!isMobile}
                    onDragStart={(e) => onDragStart(e, nodeType)}
                    onClick={() => isMobile && onAddNode(nodeType)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md hover:bg-accent transition-all",
                      isMobile ? "cursor-pointer p-2" : "cursor-grab active:cursor-grabbing p-1"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-sm",
                        config.color
                      )}
                    >
                      <Icon className="size-3.5 text-white" />
                    </div>

                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePanel;
