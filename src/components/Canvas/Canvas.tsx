'use client';

import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import Photo from './Photo';
import Label from './Label';
import { forceSimulation, forceCenter, forceCollide, SimulationNodeDatum, forceLink } from 'd3-force';

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
      photo_metadata: { public_id?: string, notes?: string };
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
    metadata?: {       // Nuevo campo para almacenar metadata
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
    const label = group.find(n => n.isLabel);
    const photos = group.filter(n => !n.isLabel);

    // Conectar cada foto con la etiqueta central
    photos.forEach(photo => {
      links.push({
        source: label!.id,
        target: photo.id
      });
    });

    // Opcional: conexiones entre fotos para mantener estructura
    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        if (Math.random() > 0.7) { // Conectar solo algunas fotos entre sí
          links.push({
            source: photos[i].id,
            target: photos[j].id,
            distance: 200 // Mayor distancia entre fotos
          });
        }
      }
    }
  }

  return links;
}

const Canvas = () => {
  const stageRef = useRef<any>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/pages/api/photos'); // Nota: cambié la ruta
        const data = await response.json(); // Esperamos a que se resuelva la Promise
        setRolls(data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };
  
    fetchData();
  }, []);



  useEffect(() => {
    if (!rolls.length) return;
    const W = window.innerWidth, H = window.innerHeight;
    const R = 800, N = rolls.length;
    const centers = rolls.map((_, i) => ({
      x: W/2 + R * Math.cos(2*Math.PI*i/N),
      y: H/2 + R * Math.sin(2*Math.PI*i/N),
    }));

    const allNodes: GraphNode[] = [];
    rolls.forEach((roll, i) => {
      const c = centers[i];

      allNodes.push({
        id: `${roll.id}-label`,
        width: 200, // Ancho fijo para las etiquetas
        height: 60, // Alto fijo para las etiquetas
        rolloId: roll.id,
        rolloCenter: c,
        x: c.x + Math.random()*50 - 25,
        y: c.y + Math.random()*50 - 25,
        isLabel: true,
        metadata: roll.metadata
      });

      roll.photos.forEach((p, j) => {
        allNodes.push({
          id: `${roll.id}-${j}`,
          imageUrl: p.url,
          width: p.width,
          height: p.width * (3/4),   // asume ratio 4:3, o précarga si prefieres
          rolloId: roll.id,
          note: p.photo_metadata?.notes,
          rolloCenter: c,
          x: c.x + Math.random()*50 - 25,
          y: c.y + Math.random()*50 - 25,
        });
      });
    });
  
      const simulation = forceSimulation<GraphNode>(allNodes)
  .force('center', forceCenter(W / 2, H / 2))
  .force('collide', forceCollide<GraphNode>(d => {
    if (d.isLabel) {
      // Radio más pequeño para etiquetas (ajusta estos valores)
      return 80; // Radio fijo pequeño para etiquetas
    }
    // Radio proporcional al tamaño para fotos
    return Math.min(d.width / 2 + 100); // Límite máximo de 100 para fotos
  }).strength(0.7)) // Fuerza de colisión (puedes ajustar)
  .force('link', forceLink<GraphNode, any>(allNodes)
    .id((d) => d.id)
    .distance(1)
    .strength(0.03)
    .links(generateLinks(allNodes))
  )
  .stop();

  
      for (let i = 0; i < 600; i++) simulation.tick();
      setNodes(allNodes);

  }, [rolls]);

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

    stage.container().addEventListener('wheel', handleWheel);

    return () => {
      stage.container().removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 800}
      height={typeof window !== 'undefined' ? window.innerHeight : 600}
      draggable
      style={{ background: '#171717' }}
    >
     <Layer>
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
