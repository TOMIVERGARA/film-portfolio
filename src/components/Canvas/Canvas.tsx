'use client';

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Photo from './Photo';
import Konva from 'konva';

interface PhotoProps {
  url: string;
  x: number;
  y: number;
  width: number;
}

const Canvas = () => {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);

  const photos: PhotoProps[] = [
    { url: '/photos/photo1.jpg', x: 100, y: 100, width: 200 },
    { url: '/photos/photo2.jpg', x: 400, y: 200, width: 200 },
    { url: '/photos/photo3.jpg', x: 700, y: 400, width: 200 },
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

      setScale(newScale); // 🛎️ Actualizar el estado del zoom
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
        {photos.map((photo, index) => (
          <Photo
            key={index}
            url={photo.url}
            x={photo.x}
            y={photo.y}
            width={photo.width}
            zoomScale={scale} // 👈 Le pasamos el zoom a cada Photo
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
