"use client";

import { useCanvas } from "../CanvasContext";
import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    if (!rolls.length) return;

    const W = window.innerWidth,
      H = window.innerHeight;
    const R = 800,
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

      // Posiciones iniciales y finales
      const startX = stage.x();
      const startY = stage.y();
      const targetX = window.innerWidth / 2 - center.x * stage.scaleX();
      const targetY = window.innerHeight / 2 - center.y * stage.scaleX();

      const anim = new Konva.Animation((frame) => {
        if (!frame) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing suave sin zoom
        const easedProgress = easeOutSine(progress);

        // Movimiento lineal puro
        const currentX = startX + (targetX - startX) * easedProgress;
        const currentY = startY + (targetY - startY) * easedProgress;

        stage.position({
          x: currentX,
          y: currentY,
        });

        if (progress === 1) {
          anim.stop();
          setShouldCenter(false);
          // Ajuste final de precisión
          stage.position({ x: targetX, y: targetY });
        }
      });

      anim.start();
      return () => {
        anim.stop();
      };
    }
  }, [shouldCenter, currentRollIndex, rollCenters]);

  useEffect(() => {
    if (!stageRef.current || rollCenters.length === 0) return;

    const center = rollCenters[currentRollIndex];
    if (!center) return;

    const stage = stageRef.current;
    const startTime = Date.now();
    const duration = 3000; // Duración óptima para el efecto
    const zoomFactor = 0.2; // Nivel máximo de zoom out

    // Valores iniciales
    const startScale = stage.scaleX();
    const startX = stage.x();
    const startY = stage.y();

    // Objetivo final
    const targetScale = startScale;
    const targetX = window.innerWidth / 2 - center.x * targetScale;
    const targetY = window.innerHeight / 2 - center.y * targetScale;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Curva personalizada para sincronizar zoom y movimiento
      const progress = easeOutSine(rawProgress);

      // Interpolación de escala (zoom out-in suave)
      const scaleProgress = Math.sin(progress * Math.PI); // Curva sinusoidal
      const currentScale = startScale * (1 - zoomFactor * scaleProgress);

      // Interpolación de posición (considerando el zoom cambiante)
      const posProgress =
        progress < 0.5
          ? 2 * progress * progress // Aceleración inicial
          : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Desaceleración final

      const currentX = startX + (targetX - startX) * posProgress;
      const currentY = startY + (targetY - startY) * posProgress;

      stage.scale({ x: currentScale, y: currentScale });
      stage.position({ x: currentX, y: currentY });

      if (rawProgress === 1) {
        anim.stop();
        stage.scale({ x: targetScale, y: targetScale }); // Asegurar escala final
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

      // Detectar si es trackpad o mouse
      // Los trackpads suelen enviar valores decimales y más pequeños
      const isTrackpad = Math.abs(e.deltaY) < 50 && e.deltaY % 1 !== 0;

      let newScale;

      if (isTrackpad) {
        // Para trackpad: zoom suave y continuo
        // Usar un factor mucho más pequeño para que sea realmente suave
        const delta = e.deltaY / 1000; // Ajustado para mayor sensibilidad pero suave
        newScale = oldScale * (1 + delta);

        // Sin límites por frame para permitir movimiento fluido
      } else {
        // Para mouse: zoom discreto tradicional
        const scaleBy = 1.08;
        const direction = e.deltaY > 0 ? 1 : -1;
        newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      }

      // Limitar escala global
      newScale = Math.max(0.1, Math.min(5, newScale));

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();

      setScale(newScale);
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
    };
  }, []);

  return (
    <div id="konva-container">
      <Stage
        ref={stageRef}
        width={typeof window !== "undefined" ? window.innerWidth : 800}
        height={typeof window !== "undefined" ? window.innerHeight : 600}
        draggable
        style={{ background: "#171717", position: "fixed", zIndex: 10 }}
      >
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
