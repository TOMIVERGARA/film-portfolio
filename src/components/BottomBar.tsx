"use client";

import { useCanvas } from "./CanvasContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Target,
  ArrowLeft,
  ArrowRight,
  FileUser,
  Undo2,
  Info,
} from "lucide-react";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Separator } from "./ui/separator";
import { AboutMe } from "./AboutMe";
import { useEffect, useState } from "react";

export function BottomBar() {
  const { currentRollIndex, rollsCount, centerOnRoll, setCurrentRollIndex } =
    useCanvas();

  const [showAbout, setShowAbout] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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

  useEffect(() => {
    const hasVisitedAbout = localStorage.getItem("hasVisitedAbout");
    setShowNotification(!hasVisitedAbout);
  }, []);

  const handleAboutClick = () => {
    if (!showAbout) {
      // Cuando el usuario abre el About Me, guardamos en localStorage
      localStorage.setItem("hasVisitedAbout", "true");
      setShowNotification(false);
    }
    setShowAbout(!showAbout);
  };

  return (
    <>
      <AboutMe isVisible={showAbout} onClose={() => setShowAbout(false)} />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-lg p-1 shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  asChild
                  className="hover:bg-neutral-600/20 bg-black/0 rounded-none relative" // Añade 'relative' aquí
                  onClick={() => handleAboutClick()}
                >
                  <Link href="/">
                    {showAbout ? <Undo2 /> : <FileUser />}
                    {/* Elemento de ping/anotación */}
                    {showNotification && (
                      <span className="absolute h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                      </span>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                {" "}
                {showAbout ? "back to canvas" : "about me"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AnimatePresence>
            {!showAbout && (
              <motion.div
                key="middle-buttons"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-2"
              >
                <Separator className="h-7" orientation="vertical" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        asChild
                        className="hover:bg-neutral-600/20 bg-black/0 rounded-none"
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
                        className="hover:bg-neutral-600/20 bg-black/0 hover:animate-pulse rounded-none"
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
                        className="hover:bg-neutral-600/20 bg-black/0 rounded-none"
                        onClick={handleMoveForward}
                      >
                        <Link href="/">
                          <ArrowRight />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="mb-2">
                      move forward
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Separator className="h-7" orientation="vertical" />
              </motion.div>
            )}
          </AnimatePresence>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild></TooltipTrigger>
              <TooltipContent className="mb-2">search</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <HoverCard openDelay={200} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Button
                size="icon"
                className="hover:bg-neutral-600/20 bg-black/0  rounded-none"
                asChild
              >
                <Link href="/">
                  <Info />
                </Link>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent sideOffset={15}>
              <div className="prose prose-invert prose-neutral">
                <h4 className="text-lg font-serif">did you know?</h4>
                <p className="lowercase text-justify text-sm">
                  This portfolio is meant to represent how these photos live in
                  my mind:{" "}
                  <i>
                    <b>
                      organized, yet a little chaotic. Structured, but organic.
                    </b>
                  </i>{" "}
                  Just a collection of images with strong meaning, floating
                  freely through infinite space.
                </p>
                <p className="lowercase text-justify text-sm mt-1/2">
                  To reflect that, the canvas you're seeing is procedurally
                  generated using a simulation of physical forces. These forces
                  determine how each image interacts with the others, making the
                  layout unique to you, in this moment.
                </p>
                <Separator className="mt-0 mb-0 h-0.5" />
                <p className="lowercase text-justify text-sm mt-1/2 italic">
                  You can use the navigation controls to move between different
                  rolls, but you're also free to zoom, pan, and explore as much
                  as you like. Take your time—there's no wrong way to wander.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </>
  );
}
