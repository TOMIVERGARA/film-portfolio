'use client';

import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import Photo from './Photo';
import { forceSimulation, forceManyBody, forceCenter, forceCollide, SimulationNodeDatum, forceLink } from 'd3-force';

interface Rollo {
    id: string;
    photos: {
      url: string;
      width: number;
      aspectRatio?: number; // opcional
    }[];
  }
  
  interface GraphNode extends SimulationNodeDatum {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
    rolloId: string;
    rolloCenter: { x: number; y: number };
    x?: number;
    y?: number;
  }

  

  function forceRolloCenter(nodes: GraphNode[], strength = 0.001) {
    function force(alpha: number) {
      for (const node of nodes) {
        if (!node.rolloCenter) continue;
        node.vx = (node.vx ?? 0) + (node.rolloCenter.x - (node.x ?? 0)) * strength * alpha;
        node.vy = (node.vy ?? 0) + (node.rolloCenter.y - (node.y ?? 0)) * strength * alpha;
      }
    }
    return force;
  }

  function generateLinks(nodes: GraphNode[]) {
    const links = [];
  
    const groups = nodes.reduce((acc, node) => {
      acc[node.rolloId] = acc[node.rolloId] || [];
      acc[node.rolloId].push(node);
      return acc;
    }, {} as Record<string, GraphNode[]>);
  
    for (const group of Object.values(groups)) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          links.push({ source: group[i].id, target: group[j].id });
        }
      }
    }
  
    return links;
  }

const Canvas = () => {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<any[]>([]);

  const rolls: Rollo[] = [
    {
      id: "rollo1",
      photos: [
        { url: "/photos/rollo1/photo1.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo1/photo2.jpg", width: 200, aspectRatio: 1.5 },
      ],
    },
    {
      id: "rollo2",
      photos: [
        { url: "/photos/rollo2/photo1.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo2.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo3.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo4.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo5.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo6.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo7.jpg", width: 200, aspectRatio: 1.5 },
        { url: "/photos/rollo2/photo8.jpg", width: 200, aspectRatio: 1.5 },
      ],
    },
  ];

  function preloadImage(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
    });
  }

  useEffect(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    const height = typeof window !== 'undefined' ? window.innerHeight : 600;
  
    const totalRollos = rolls.length;
    const distanceBetweenRolls = 800;
    
    const rollCenters = rolls.map((_, i) => ({
      x: width / 2 + distanceBetweenRolls * Math.cos((i / totalRollos) * 2 * Math.PI),
      y: height / 2 + distanceBetweenRolls * Math.sin((i / totalRollos) * 2 * Math.PI),
    }));
  
    async function setupNodes() {
      const allNodes: GraphNode[] = [];
  
      for (let rollIndex = 0; rollIndex < rolls.length; rollIndex++) {
        const roll = rolls[rollIndex];
        const center = rollCenters[rollIndex];
  
        for (const photo of roll.photos) {
          try {
            const { width: naturalWidth, height: naturalHeight } = await preloadImage(photo.url);
            
            const fixedWidth = photo.width ?? 200;
            const aspectRatio = photo.aspectRatio ?? naturalWidth / naturalHeight;
            const calculatedHeight = fixedWidth / aspectRatio;
  
            allNodes.push({
              id: `${roll.id}-${photo.url}`,
              imageUrl: photo.url,
              width: fixedWidth,
              height: calculatedHeight,
              rolloId: roll.id,
              rolloCenter: center,
              x: center.x + Math.random() * 100 - 50,
              y: center.y + Math.random() * 100 - 50,
            });
          } catch (error) {
            console.error("Error loading image:", photo.url, error);
          }
        }
      }
  
      const simulation = forceSimulation<GraphNode>(allNodes)
  .force('center', forceCenter(width / 2, height / 2))
   .force('collide', forceCollide<GraphNode>(d => d.width / 2 + 10).radius(170)) // colisión
  .force('link', forceLink<GraphNode, any>(allNodes)
    .id((d) => d.id)
    .distance(1)
    .strength(0.005)
    .links(generateLinks(allNodes))
  )
  .stop();
  
      for (let i = 0; i < 400; i++) {
        simulation.tick();
      }
  
      setNodes(allNodes);
    }
  
    setupNodes();
  }, []);

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
      style={{ background: '#1a1a1a' }}
    >
      <Layer>
      {nodes.map((node, index) => (
        <div>
        {/* <Circle 
        x={node.x}
        y={node.y}
        radius={170}
  fill={'red'}
        /> */}

  <Photo
    key={index}
    url={node.imageUrl}
    x={node.x}
    y={node.y}
    width={node.width}
    zoomScale={scale}
  />
        </div>
))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
