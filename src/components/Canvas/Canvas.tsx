'use client';

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Photo from './Photo';
import Konva from 'konva';

interface PhotoProps {
  url: string;
  width: number;
}

const Canvas = () => {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);

  const photos: PhotoProps[] = [
    { url: '/photos/photo1.jpg', width: 200 },
    { url: '/photos/photo2.jpg', width: 200 },
    { url: '/photos/photo3.jpg', width: 200 },
    { url: '/photos/photo4.jpg', width: 200 },
    { url: '/photos/photo5.jpg', width: 200 },
  ];

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

      setScale(newScale); // 🛎️ Actualizamos zoom
    };

    stage.container().addEventListener('wheel', handleWheel);

    return () => {
      stage.container().removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Distribuir en círculo
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
  const radius = 300; // Distancia desde el centro

  const photosWithPositions = photos.map((photo, index) => {
    const angle = (index / photos.length) * Math.PI * 2; // Distribuye de forma equitativa
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...photo, x, y };
  });

  return (
    <Stage
      ref={stageRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 800}
      height={typeof window !== 'undefined' ? window.innerHeight : 600}
      draggable
      style={{ background: '#1a1a1a' }}
    >
      <Layer>
        {photosWithPositions.map((photo, index) => (
          <Photo
            key={index}
            url={photo.url}
            x={photo.x}
            y={photo.y}
            width={photo.width}
            zoomScale={scale} // 👈 seguimos pasando el zoom
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
