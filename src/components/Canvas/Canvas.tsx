"use client";

import { useCanvas } from "../CanvasContext";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Stage, Layer, Circle } from "react-konva";
import Photo from "./Photo";
import Label from "./Label";
import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceX,
  forceY,
} from "d3-force";
import Konva from "konva";
import { Roll, GraphNode } from "@/types";
import { useAnalyticsContext } from "../AnalyticsProvider";

function generateLinks(nodes: GraphNode[]) {
  const links = [];
  const groups = nodes.reduce((acc, node) => {
    acc[node.rolloId] = acc[node.rolloId] || [];
    acc[node.rolloId].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  for (const group of Object.values(groups)) {
    const centro = group.find((n) => n.isCentral); // Buscar el nodo central
    const otrasFotos = group.filter((n) => !n.isCentral);

    // Conectar cada foto con el centro
    otrasFotos.forEach((foto) => {
      links.push({
        source: centro!.id,
        target: foto.id,
        distance: 150, // Distancia base desde el centro
      });
    });

    // (Opcional) Conexiones entre fotos secundarias
    for (let i = 0; i < otrasFotos.length; i++) {
      for (let j = i + 1; j < otrasFotos.length; j++) {
        if (Math.random() > 0.8) {
          links.push({
            source: otrasFotos[i].id,
            target: otrasFotos[j].id,
            distance: 200, // Mayor distancia entre fotos
          });
        }
      }
    }
  }

  return links;
}

const Canvas = () => {
  const stageRef = useRef<any>(null);

  const { currentRollIndex, setRollsCount, shouldCenter, setShouldCenter } =
    useCanvas();
  const [rollCenters, setRollCenters] = useState<{ x: number; y: number }[]>(
    []
  );

  const { rolls } = useCanvas();
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<any[]>([]);

  // Optimización: Memoizar la grilla y solo renderizar puntos visibles
  const gridDots = useMemo(() => {
    const dots = [];
    const gridSpacing = 50;

    // Calcular opacidad con transición más suave y gradual
    // Aparece desde zoom 1.0x hasta estar completamente visible en 3.0x
    const opacity = Math.min(Math.max((scale - 0.8) / 2.0, 0), 0.15);

    if (opacity <= 0) return null;

    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    // Optimización: Solo renderizar puntos visibles en viewport
    const stage = stageRef.current;
    if (!stage) {
      // Primera renderización: área reducida
      const visibleArea = 1500;
      for (let x = -visibleArea; x <= visibleArea; x += gridSpacing) {
        for (let y = -visibleArea; y <= visibleArea; y += gridSpacing) {
          dots.push(
            <Circle
              key={`grid-${x}-${y}`}
              x={centerX + x}
              y={centerY + y}
              radius={1.5}
              fill="#a3a3a3"
              opacity={opacity}
            />
          );
        }
      }
      return dots;
    }

    // Calcular área visible basada en posición y zoom del stage
    const stagePos = stage.position();
    const stageScale = stage.scaleX();
    const viewportWidth = window.innerWidth / stageScale;
    const viewportHeight = window.innerHeight / stageScale;

    // Agregar margen para suavizar transiciones
    const margin = 500;
    const minX =
      Math.floor(
        (-stagePos.x / stageScale - viewportWidth / 2 - margin) / gridSpacing
      ) * gridSpacing;
    const maxX =
      Math.ceil(
        (-stagePos.x / stageScale + viewportWidth / 2 + margin) / gridSpacing
      ) * gridSpacing;
    const minY =
      Math.floor(
        (-stagePos.y / stageScale - viewportHeight / 2 - margin) / gridSpacing
      ) * gridSpacing;
    const maxY =
      Math.ceil(
        (-stagePos.y / stageScale + viewportHeight / 2 + margin) / gridSpacing
      ) * gridSpacing;

    for (let x = minX; x <= maxX; x += gridSpacing) {
      for (let y = minY; y <= maxY; y += gridSpacing) {
        dots.push(
          <Circle
            key={`grid-${x}-${y}`}
            x={centerX + x}
            y={centerY + y}
            radius={1.5}
            fill="#a3a3a3"
            opacity={opacity}
          />
        );
      }
    }

    return dots;
  }, [scale]);

  useEffect(() => {
    if (!rolls.length) return;

    const W = window.innerWidth,
      H = window.innerHeight;
    const R = 1200, // Aumentado de 800 a 1200 para mayor separación entre rolls
      N = rolls.length;

    const centers = rolls.map((_, i) => ({
      x: W / 2 + R * Math.cos((2 * Math.PI * i) / N),
      y: H / 2 + R * Math.sin((2 * Math.PI * i) / N),
    }));

    setRollCenters(centers);
    setRollsCount(rolls.length);

    const allNodes: GraphNode[] = [];
    rolls.forEach((roll, i) => {
      const c = centers[i];

      // 1. Seleccionar foto central aleatoria y FIJARLA en el centro
      const randomIndex = Math.floor(Math.random() * roll.photos.length);
      const fotoCentral = roll.photos[randomIndex];

      // Nodo central (fijo)
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
        fx: c.x, // Fuerza fija para mantener posición
        fy: c.y,
        isCentral: true,
      });

      // 2. Crear etiqueta (label) como nodo normal
      allNodes.push({
        id: `${roll.id}-label`,
        width: 200,
        height: 60,
        rolloId: roll.id,
        rolloCenter: c,
        x: c.x + Math.random() * 50 - 25, // Posición inicial aleatoria
        y: c.y + Math.random() * 50 - 25,
        isLabel: true,
        metadata: roll.metadata,
      });

      // 3. Resto de fotos (incluyendo la original si es necesario)
      roll.photos.forEach((p, j) => {
        if (j === randomIndex) return; // Saltar la foto central ya creada
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
        });
      });
    });

    const simulation = forceSimulation<GraphNode>(allNodes)
      .force("x", forceX<GraphNode>((d) => d.rolloCenter.x).strength(0.05)) // Fuerza de atracción horizontal
      .force("y", forceY<GraphNode>((d) => d.rolloCenter.y).strength(0.05)) // Fuerza de atracción vertical
      .force(
        "collide",
        forceCollide<GraphNode>((d) => {
          if (d.isLabel) {
            // Radio más pequeño para etiquetas (ajusta estos valores)
            return 80; // Radio fijo pequeño para etiquetas
          }
          // Radio proporcional al tamaño para fotos
          return Math.min(d.width / 2 + 100); // Límite máximo de 100 para fotos
        }).strength(0.7)
      ) // Fuerza de colisión (puedes ajustar)
      .force(
        "link",
        forceLink<GraphNode, any>(allNodes)
          .id((d) => d.id)
          .distance(100) // Aumentar distancia base
          .strength(0.1) // Aumentar fuerza de conexión
          .links(generateLinks(allNodes))
      )
      .stop();

    for (let i = 0; i < 600; i++) simulation.tick();
    setNodes(allNodes);
  }, [rolls]);

  useEffect(() => {
    if (shouldCenter && rollCenters.length > 0) {
      const center = rollCenters[currentRollIndex];
      if (!center || !stageRef.current) return;

      const stage = stageRef.current;
      const startTime = Date.now();
      const duration = 800; // Duración óptima para todo tipo de distancias

      // Posiciones y escalas iniciales y finales
      const startX = stage.x();
      const startY = stage.y();
      const startScale = stage.scaleX();
      const targetScale = 1.5; // Zoom más cercano (ajusta este valor según prefieras)
      const targetX = window.innerWidth / 2 - center.x * targetScale;
      const targetY = window.innerHeight / 2 - center.y * targetScale;

      const anim = new Konva.Animation((frame) => {
        if (!frame) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing suave para movimiento y zoom
        const easedProgress = easeOutSine(progress);

        // Interpolar escala (zoom)
        const currentScale =
          startScale + (targetScale - startScale) * easedProgress;

        // Interpolar posición
        const currentX = startX + (targetX - startX) * easedProgress;
        const currentY = startY + (targetY - startY) * easedProgress;

        stage.scale({ x: currentScale, y: currentScale });
        stage.position({
          x: currentX,
          y: currentY,
        });

        setScale(currentScale); // Actualizar el estado del scale

        if (progress === 1) {
          anim.stop();
          setShouldCenter(false);
          // Ajuste final de precisión
          stage.scale({ x: targetScale, y: targetScale });
          stage.position({ x: targetX, y: targetY });
          setScale(targetScale);
        }
      });

      anim.start();
      return () => {
        anim.stop();
      };
    }
  }, [shouldCenter, currentRollIndex, rollCenters, setShouldCenter]);

  useEffect(() => {
    if (!stageRef.current || rollCenters.length === 0) return;

    const center = rollCenters[currentRollIndex];
    if (!center) return;

    const stage = stageRef.current;
    const startTime = Date.now();
    const duration = 2000; // Duración más lenta para suavidad

    // Valores iniciales
    const startScale = stage.scaleX();
    const startX = stage.x();
    const startY = stage.y();

    // Objetivo final con zoom predeterminado
    const targetScale = 1.5;
    const targetX = window.innerWidth / 2 - center.x * targetScale;
    const targetY = window.innerHeight / 2 - center.y * targetScale;

    // Determinar si necesitamos zoom out o podemos ir directo
    const needsZoomOut = startScale > targetScale * 0.8; // Solo si estamos muy cerca
    const intermediateScale = needsZoomOut
      ? Math.min(startScale * 0.7, targetScale * 0.7)
      : startScale;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Easing suave
      const progress = easeOutSine(rawProgress);

      // Interpolación de escala más suave
      let currentScale;
      if (needsZoomOut && progress < 0.4) {
        // Zoom out suave solo en la primera parte si es necesario
        const zoomOutProgress = progress / 0.4;
        currentScale =
          startScale + (intermediateScale - startScale) * zoomOutProgress;
      } else {
        // Zoom in hacia targetScale
        const zoomInStart = needsZoomOut ? 0.4 : 0;
        const zoomInProgress = (progress - zoomInStart) / (1 - zoomInStart);
        const fromScale = needsZoomOut ? intermediateScale : startScale;
        currentScale = fromScale + (targetScale - fromScale) * zoomInProgress;
      }

      // Interpolación de posición suave
      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY + (targetY - startY) * progress;

      stage.scale({ x: currentScale, y: currentScale });
      stage.position({ x: currentX, y: currentY });
      setScale(currentScale);

      if (rawProgress === 1) {
        anim.stop();
        stage.scale({ x: targetScale, y: targetScale });
        stage.position({ x: targetX, y: targetY });
        setScale(targetScale);
      }
    });

    anim.start();
    return () => {
      anim.stop();
    };
  }, [currentRollIndex, rollCenters]);

  const easeOutSine = (t: number) => {
    return Math.sin((t * Math.PI) / 2);
  };

  // Optimización: Throttle para setScale
  const throttledSetScale = useRef<NodeJS.Timeout | null>(null);
  const updateScale = useCallback((newScale: number) => {
    if (throttledSetScale.current) {
      clearTimeout(throttledSetScale.current);
    }
    throttledSetScale.current = setTimeout(() => {
      setScale(newScale);
    }, 16); // ~60fps
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    let lastDistance = 0;
    let isPinching = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Detectar si es trackpad o mouse basado en deltaY
      const isTrackpad = Math.abs(e.deltaY) < 50 && e.deltaY % 1 !== 0;

      let newScale;

      if (isTrackpad) {
        // Para trackpad: zoom ultra suave y continuo con menor sensibilidad
        const delta = -e.deltaY / 3000; // Reducido de 800 a 1200 para menor sensibilidad
        newScale = oldScale * (1 + delta);
      } else {
        // Para mouse wheel: zoom más responsivo pero suave (sin cambios)
        const scaleBy = 1.15; // Mayor factor para sentir cambios más claros
        const direction = e.deltaY > 0 ? -1 : 1; // Invertido para dirección natural
        newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      }

      // Sin límite máximo de zoom, solo mínimo
      newScale = Math.max(0.05, newScale); // Permite zoom out hasta 0.05x y zoom in ilimitado

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);

      // Usar throttled update
      updateScale(newScale);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching = true;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinching || e.touches.length !== 2) return;

      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastDistance === 0) {
        lastDistance = currentDistance;
        return;
      }

      const oldScale = stage.scaleX();

      // Centro entre los dos dedos
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      const mousePointTo = {
        x: (centerX - stage.x()) / oldScale,
        y: (centerY - stage.y()) / oldScale,
      };

      // Calcular nuevo scale con mayor sensibilidad
      const scaleDelta = currentDistance / lastDistance;
      // Amplificar el cambio para hacerlo más rápido
      const amplifiedDelta = 1 + (scaleDelta - 1) * 2.5; // Factor 2.5 para mayor velocidad
      let newScale = oldScale * amplifiedDelta;

      // Limitar escala
      newScale = Math.max(0.1, Math.min(5, newScale));

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: centerX - mousePointTo.x * newScale,
        y: centerY - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();

      setScale(newScale);
      lastDistance = currentDistance;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching = false;
        lastDistance = 0;
      }
    };

    const container = stage.container();
    container.addEventListener("wheel", handleWheel);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      if (throttledSetScale.current) {
        clearTimeout(throttledSetScale.current);
      }
    };
  }, [updateScale]);

  return (
    <div id="konva-container">
      <Stage
        ref={stageRef}
        width={typeof window !== "undefined" ? window.innerWidth : 800}
        height={typeof window !== "undefined" ? window.innerHeight : 600}
        draggable
        style={{ background: "#171717", position: "fixed", zIndex: 10 }}
      >
        {/* Capa de grilla optimizada */}
        <Layer listening={false}>{gridDots}</Layer>

        {/* Capa principal con contenido */}
        <Layer>
          {rollCenters.map((center, index) => (
            <Circle
              key={`debug-${index}`}
              x={center.x}
              y={center.y}
              radius={5 / scale} // Radio que se ajusta con el zoom
              fill={index === currentRollIndex ? "#3b82f6" : "#9ca3af"} // Azul para el actual, gris para otros
              opacity={0.8}
            />
          ))}
          {nodes.map((node, index) => {
            if (node.isLabel) {
              return (
                <Label
                  key={index}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  zoomScale={scale}
                  metadata={node.metadata}
                />
              );
            } else {
              return (
                <Photo
                  key={index}
                  url={node.imageUrl}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  zoomScale={scale}
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
