'use client';

import { HandIcon, Maximize, MinusIcon, MousePointer, PlusIcon, Trash2 } from "lucide-react";
import { useReactFlow, useStore } from "@xyflow/react";

import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/workflow";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type Props = {
  toolMode: ToolModeType;
  setToolMode: (toolMode: ToolModeType) => void;
  canDeleteSelected: boolean;
  onDeleteSelected: () => void;
  isMobile?: boolean;
};

const Controls = ({
  toolMode,
  setToolMode,
  canDeleteSelected,
  onDeleteSelected,
  isMobile = false,
}: Props) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={cn(
        "absolute left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background/80 px-3 py-1.5 shadow-lg backdrop-blur-md",
        isMobile ? "bottom-4 max-w-[calc(100vw-1rem)]" : "bottom-6"
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant={toolMode === TOOL_MODE_ENUM.HAND ? "secondary" : "ghost"}
          className="h-8 w-8 rounded-full"
          onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
        >
          <HandIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant={toolMode === TOOL_MODE_ENUM.SELECT ? "secondary" : "ghost"}
          className="h-8 w-8 rounded-full"
          onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
        >
          <MousePointer size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-px">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
          onClick={() => zoomOut()}
        >
          <MinusIcon size={16} />
        </Button>
        <div className="min-w-7 text-center text-[13px] font-medium tabular-nums">
          {zoomPercent}%
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
          onClick={() => zoomIn()}
        >
          <PlusIcon size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full"
        onClick={() => fitView()}
      >
        <Maximize size={16} />
      </Button>

      <Separator orientation="vertical" className="h-4" />

      {!isMobile && (
        <Button
          size="icon"
          variant={canDeleteSelected ? "destructive" : "ghost"}
          className="h-8 w-8 rounded-full"
          onClick={onDeleteSelected}
          disabled={!canDeleteSelected}
          aria-label="Delete selected node"
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  );
};

export default Controls;
