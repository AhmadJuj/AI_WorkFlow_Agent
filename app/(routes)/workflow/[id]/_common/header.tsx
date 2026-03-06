"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Code, MoreHorizontal, Pencil, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkflow } from "@/context/workflow-context";

type PropsType = {
  isLoading?: boolean;
  name?: string;
  workflowId?: string;
};

const tabs = [
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "preview", label: "Preview", icon: Play },
] as const;

const Header = ({ name, isLoading }: PropsType) => {
  const { view, setView } = useWorkflow();

  const zIndex = view === "preview" ? "z-99" : "";

  const handleSetView = (tabId: "edit" | "preview") => {
    setView(tabId);
  };

  return (
    <div className="relative">
      <header className="w-full bg-transparent absolute top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/workflow"
            className="flex items-center gap-3 bg-card py-1 px-1 rounded-lg"
          >
            <Button variant="secondary" size="icon" className="size-8!">
              <ChevronLeft className="size-4" />
            </Button>
            <div>
              {isLoading ? (
                <Skeleton className="w-20" />
              ) : (
                <h1 className="text-sm font-semibold truncate max-w-50">
                  {name || "Untitled Workflow"}
                </h1>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1 rounded-lg bg-muted p-1 mt-1 z-999!">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSetView(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    view === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-card p-1 rounded-lg">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Code
            </Button>
          </div>

        </div>
      </header>
    </div>
  );
};

export default Header;