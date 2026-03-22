"use client"
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon, LogOutIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React, { useEffect, useState } from 'react'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";
  const { user } = useKindeBrowserClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="border-b border-border bg-background">
      <div className="w-full px-4 md:px-6 mx-auto max-w-6xl h-11 flex items-center justify-between">
        <div></div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full size-8"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            disabled={!mounted}
          >
            <SunIcon
              className={cn(
                "absolute h-5 w-5 transition-transform",
                mounted ? (isDark ? "scale-100" : "scale-0") : "scale-100"
              )}
            />
            <MoonIcon
              className={cn(
                "absolute h-5 w-5 transition-transform",
                mounted ? (isDark ? "scale-0" : "scale-100") : "scale-0"
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-8 shrink-0 rounded-full">
                <AvatarImage src={user?.picture || ""} alt={user?.given_name || ""} />
                <AvatarFallback className="rounded-full">
                  {user?.given_name?.charAt(0)}
                  {user?.family_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <LogoutLink className="flex items-center gap-2 w-full cursor-pointer">
                  <LogOutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </LogoutLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  );
}

export default Header;