"use client";

import { useCanvas } from "../CanvasContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Circle } from "react-konva";
import Photo from "./Photo";
import Label from "./Label";
import {
  forceSimulation,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  forceLink,
  forceX,
  forceY,
} from "d3-force";
import Konva from "konva";

interface Roll {
  id: string;
  metadata: {
    name?: string;
    date?: string;
    filmstock?: string;
  };
  photos: {
    url: string;
    width: number;
    photo_metadata: { public_id?: string; notes?: string };
  }[];
}

interface GraphNode extends SimulationNodeDatum {
  id: string;
  imageUrl?: string; // Hacerlo opcional para nodos de etiqueta
  width: number;
  height: number;
  rolloId: string;
  note?: string;
  rolloCenter: { x: number; y: number };
  x?: number;
  y?: number;
  isLabel?: boolean; // Nuevo campo para identificar nodos de etiqueta
  isCentral?: boolean; // Nuevo campo para identificar nodo central
  metadata?: {
    // Nuevo campo para almacenar metadata
    name?: string;
    date?: string;
    filmstock?: string;
  };
}

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

  const [rolls, setRolls] = useState<Roll[]>([]);
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/pages/api/photos"); // Nota: cambié la ruta
        const data = await response.json(); // Esperamos a que se resuelva la Promise
        setRolls(data);
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchData();
  }, []);

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
      const duration = 1000;
      const zoomOutFactor = 0.4;
      const startScale = stage.scaleX();

      const startX = stage.x();
      const startY = stage.y();
      const targetX = window.innerWidth / 2 - center.x * startScale;
      const targetY = window.innerHeight / 2 - center.y * startScale;

      const anim = new Konva.Animation((frame) => {
        if (!frame) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutSine(progress);

        const currentScale =
          startScale * (zoomOutFactor + (1 - zoomOutFactor) * easedProgress);
        const currentX = startX + (targetX - startX) * easedProgress;
        const currentY = startY + (targetY - startY) * easedProgress;

        stage.scale({ x: currentScale, y: currentScale });
        stage.position({ x: currentX, y: currentY });

        if (progress === 1) {
          anim.stop();
          setScale(startScale);
          setShouldCenter(false); // Resetea el flag
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
    const zoomFactor = 0.4; // Nivel máximo de zoom out

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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleBy = 1.05;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.deltaY > 0 ? 1 : -1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();

      setScale(newScale);
    };

    stage.container().addEventListener("wheel", handleWheel);

    return () => {
      stage.container().removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
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
  );
};

export default Canvas;
