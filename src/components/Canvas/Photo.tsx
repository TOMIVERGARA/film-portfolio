'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from '../Utils/useImage';
import Konva from 'konva';

interface PhotoProps {
  url: string;
  x: number;
  y: number;
  width: number;
  zoomScale: number; // 👈 Nuevo prop recibido
}

const Photo = ({ url, x, y, width, zoomScale }: PhotoProps) => {
  const image = useImage(url);
  const shapeRef = useRef<any>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (image) {
      setAspectRatio(image.width / image.height);
    }
  }, [image]);

  useEffect(() => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const baseX = x - width / 2;
    const baseY = y - (width / aspectRatio)/2;
    let anim: Konva.Animation;

    anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const time = frame.time / 1000;
      const floatAmplitude = Math.min(2.5 / zoomScale, 3.5); // 🛎️ Ajusta según el zoom
      const floatSpeed = Math.min(0.5 / zoomScale, 0.8);

      const offsetX = Math.sin(time * floatSpeed + baseX) * floatAmplitude;
      const offsetY = Math.cos(time * floatSpeed + baseY) * floatAmplitude;

      node.x(baseX + offsetX);
      node.y(baseY + offsetY);
    }, node.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, [x, y, zoomScale]);

  return image ? (
    <div>
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={x - width / 2}
      y={y - (width / aspectRatio)/2}
      width={width}
      height={width / aspectRatio}

    />
    </div>
 
  ) : null;
};

export default Photo;
