"use client";

import { useCanvas } from "../CanvasContext";
import { useEffect, useState, useRef, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import Photo from "./Photo";
import Label from "./Label";
import { forceSimulation, forceCollide, forceX, forceY } from "d3-force";
import { GraphNode } from "@/types";
import Konva from "konva";

const FL = 1000; // Focal Length for 3D projection

const Canvas = () => {
  const stageRef = useRef<any>(null);
  const {
    currentRollIndex,
    setRollsCount,
    shouldCenter,
    setShouldCenter,
    rolls,
  } = useCanvas();

  // Camera state: x, y, z position
  const [camera, setCamera] = useState({ x: 0, y: 0, z: -1500 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [rollCenters, setRollCenters] = useState<
    { x: number; y: number; z: number }[]
  >([]);

  // Interaction state
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Initialize nodes with 3D positions
  useEffect(() => {
    if (!rolls.length) return;

    const W = typeof window !== "undefined" ? window.innerWidth : 1000;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;

    // Layout configuration - ORGANIC SPIRAL
    const spacing = 2000; // Spacing parameter for spiral

    // Calculate centers for each roll in 3D space using Phyllotaxis (Golden Angle Spiral)
    const centers = rolls.map((_, i) => {
      const angle = i * 2.4; // Approx golden angle in radians
      const radius = spacing * Math.sqrt(i);

      return {
        x: W / 2 + radius * Math.cos(angle),
        y: H / 2 + radius * Math.sin(angle),
        z: Math.random() * 4000, // Keep depth variation
      };
    });

    setRollCenters(centers);
    setRollsCount(rolls.length);

    const allNodes: GraphNode[] = [];

    rolls.forEach((roll, i) => {
      const c = centers[i];

      // 1. Central photo
      const randomIndex = Math.floor(Math.random() * roll.photos.length);
      const fotoCentral = roll.photos[randomIndex];

      allNodes.push({
        id: `${roll.id}-centro`,
        imageUrl: fotoCentral.url,
        width: fotoCentral.width,
        height: fotoCentral.width * (3 / 4),
        rolloId: roll.id,
        note: fotoCentral.photo_metadata?.notes,
        rolloCenter: c,
        x: c.x,
        y: c.y,
        z: c.z, // Base depth
        fx: c.x,
        fy: c.y,
        isCentral: true,
      });

      // 2. Label
      allNodes.push({
        id: `${roll.id}-label`,
        width: 200,
        height: 60,
        rolloId: roll.id,
        rolloCenter: c,
        x: c.x + Math.random() * 50 - 25,
        y: c.y + Math.random() * 50 - 25,
        z: c.z - 1000, // Move significantly closer to camera to ensure it's on top
        isLabel: true,
        metadata: roll.metadata,
      });

      // 3. Other photos
      roll.photos.forEach((p, j) => {
        if (j === randomIndex) return;

        // Random depth offset for each photo to create "cloud" effect
        // Increased spread (was 800)
        const depthOffset = (Math.random() - 0.5) * 1500;

        allNodes.push({
          id: `${roll.id}-${j}`,
          imageUrl: p.url,
          width: p.width,
          height: p.width * (3 / 4),
          rolloId: roll.id,
          note: p.photo_metadata?.notes,
          rolloCenter: c,
          x: c.x + Math.random() * 50 - 25,
          y: c.y + Math.random() * 50 - 25,
          z: c.z + depthOffset, // Individual depth
        });
      });
    });

    // Run force simulation for X/Y layout
    const simulation = forceSimulation<GraphNode>(allNodes)
      .force("x", forceX<GraphNode>((d) => d.rolloCenter.x).strength(0.05))
      .force("y", forceY<GraphNode>((d) => d.rolloCenter.y).strength(0.05))
      .force(
        "collide",
        forceCollide<GraphNode>((d) => {
          if (d.isLabel) return 150; // Increased label spacing
          return Math.min(d.width / 2 + 100); // Increased photo spacing
        }).strength(0.6)
      )
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();
    setNodes(allNodes);
  }, [rolls]);

  // Handle centering on specific roll with smooth animation
  useEffect(() => {
    if (shouldCenter && rollCenters.length > 0) {
      const center = rollCenters[currentRollIndex];
      if (center) {
        const targetX = center.x;
        const targetY = center.y;
        const targetZ = center.z - 800;

        // Simple animation loop
        const startTime = performance.now();
        const startCamera = { ...camera };
        const duration = 1000; // 1 second transition

        const animate = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic
          const ease = 1 - Math.pow(1 - progress, 3);

          setCamera({
            x: startCamera.x + (targetX - startCamera.x) * ease,
            y: startCamera.y + (targetY - startCamera.y) * ease,
            z: startCamera.z + (targetZ - startCamera.z) * ease,
          });

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setShouldCenter(false);
          }
        };

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animate);
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [shouldCenter, currentRollIndex, rollCenters, setShouldCenter]); // Removed 'camera' from deps to avoid loop

  // Projection logic
  const projectedNodes = useMemo(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1000;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;
    const cx = width / 2;
    const cy = height / 2;

    return nodes
      .map((node) => {
        const z = (node.z || 0) - camera.z;

        // Clip objects behind camera or too close
        if (z < 10) return null;

        const scale = FL / z;
        const x = (node.x! - camera.x) * scale + cx;
        const y = (node.y! - camera.y) * scale + cy;

        return {
          ...node,
          projectedX: x,
          projectedY: y,
          projectedScale: scale,
          zIndex: z, // Distance from camera
        };
      })
      .filter((n): n is NonNullable<typeof n> => n !== null)
      .sort((a, b) => b.zIndex - a.zIndex); // Sort by depth (painters algorithm)
  }, [nodes, camera]);

  // Interaction Handlers
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const delta = e.evt.deltaY;
    const zoomSpeed = 2.5;
    const dz = delta * zoomSpeed;

    // Calculate mouse position relative to center
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const width = typeof window !== "undefined" ? window.innerWidth : 1000;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;

    const mx = pointer.x - width / 2;
    const my = pointer.y - height / 2;

    // Calculate lateral movement to zoom towards cursor
    // When zooming in (dz > 0), we move camera towards mouse to keep it centered
    const dx = mx * (dz / FL);
    const dy = my * (dz / FL);

    setCamera((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
      z: prev.z + dz,
    }));
  };

  const handleMouseDown = (e: any) => {
    isDragging.current = true;
    lastMouse.current = { x: e.evt.clientX, y: e.evt.clientY };
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging.current) return;

    const dx = e.evt.clientX - lastMouse.current.x;
    const dy = e.evt.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.evt.clientX, y: e.evt.clientY };

    // Move camera opposite to drag direction
    const speed = 2.0;
    setCamera((prev) => ({
      ...prev,
      x: prev.x - dx * speed,
      y: prev.y - dy * speed,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      id="konva-container"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0D0D0D",
      }}
    >
      <Stage
        ref={stageRef}
        width={typeof window !== "undefined" ? window.innerWidth : 800}
        height={typeof window !== "undefined" ? window.innerHeight : 600}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          const touch = e.evt.touches[0];
          lastMouse.current = { x: touch.clientX, y: touch.clientY };
          isDragging.current = true;
        }}
        onTouchMove={(e) => {
          if (!isDragging.current) return;
          const touch = e.evt.touches[0];
          const dx = touch.clientX - lastMouse.current.x;
          const dy = touch.clientY - lastMouse.current.y;
          lastMouse.current = { x: touch.clientX, y: touch.clientY };

          setCamera((prev) => ({
            ...prev,
            x: prev.x - dx * 2,
            y: prev.y - dy * 2,
          }));
        }}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {projectedNodes.map((node) => {
            if (node.isLabel) {
              return (
                <Label
                  key={node.id}
                  x={node.projectedX}
                  y={node.projectedY}
                  width={node.width}
                  zoomScale={node.projectedScale}
                  metadata={node.metadata}
                />
              );
            } else {
              return (
                <Photo
                  key={node.id}
                  url={node.imageUrl!}
                  x={node.projectedX}
                  y={node.projectedY}
                  width={node.width}
                  zoomScale={node.projectedScale}
                  note={node.note}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
