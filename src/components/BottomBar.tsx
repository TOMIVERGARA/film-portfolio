"use client";

import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  PlusSquare,
  User,
  Target,
  MoveLeft,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "./ui/separator";

export function BottomBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-lg  p-1 shadow-lg">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                asChild
                className="hover:bg-neutral-600/20  rounded-none"
              >
                <Link href="/">
                  <Home />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">about</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator className="h-7" orientation="vertical" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                asChild
                className="hover:bg-neutral-600/20  rounded-none"
              >
                <Link href="/">
                  <ArrowLeft />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">move back</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={800} skipDelayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                asChild
                className="hover:bg-neutral-600/20 hover:animate-pulse rounded-none"
              >
                <Link href="/">
                  <Target />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">center</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                asChild
                className="hover:bg-neutral-600/20  rounded-none"
              >
                <Link href="/">
                  <ArrowRight />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">move fordward</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator className="h-7" orientation="vertical" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="hover:bg-neutral-600/20  rounded-none"
                asChild
              >
                <Link href="/search">
                  <Search />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">search</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
