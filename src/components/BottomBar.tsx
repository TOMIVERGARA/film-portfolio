"use client";

import { useCanvas } from "./CanvasContext";
import { Button } from "@/components/ui/button";
import {
  Search,
  Target,
  ArrowLeft,
  ArrowRight,
  FileUser,
  Images,
} from "lucide-react";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "./ui/separator";
import { AboutMe } from "./AboutMe";
import { useState } from "react";

export function BottomBar() {
  const { currentRollIndex, rollsCount, centerOnRoll, setCurrentRollIndex } =
    useCanvas();

  const [showAbout, setShowAbout] = useState(false);

  const handleMoveForward = () => {
    if (rollsCount > 0) {
      setCurrentRollIndex((prev) => (prev + 1) % rollsCount);
    }
  };

  const handleMoveBackward = () => {
    if (rollsCount > 0) {
      setCurrentRollIndex((prev) => (prev - 1 + rollsCount) % rollsCount);
    }
  };

  const handleCenter = () => {
    centerOnRoll(currentRollIndex);
  };

  return (
    <>
      <AboutMe isVisible={showAbout} onClose={() => setShowAbout(false)} />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-lg  p-1 shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  asChild
                  className="hover:bg-neutral-600/20  rounded-none"
                  onClick={() => setShowAbout(!showAbout)}
                >
                  <Link href="/">{showAbout ? <Images /> : <FileUser />}</Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                {" "}
                {showAbout ? "back to canvas" : "about me"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator className="h-7" orientation="vertical" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  asChild
                  className="hover:bg-neutral-600/20 rounded-none"
                  onClick={handleMoveBackward}
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
                  onClick={handleCenter}
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
                  className="hover:bg-neutral-600/20 rounded-none"
                  onClick={handleMoveForward}
                >
                  <Link href="/">
                    <ArrowRight />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">move forward</TooltipContent>
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
    </>
  );
}
