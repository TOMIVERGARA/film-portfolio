'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as KonvaImage, Text, Group } from 'react-konva';
import useImage from '../Utils/useImage';
import Konva from 'konva';

interface PhotoProps {
  url: string;
  x: number;
  y: number;
  width: number;
  zoomScale: number;
  note?: string; // 👈 Nuevo prop para la nota
}

const Photo = ({ url, x, y, width, zoomScale, note }: PhotoProps) => {
  const image = useImage(url);
  const groupRef = useRef<any>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [textWidth, setTextWidth] = useState(width);

  useEffect(() => {
    if (image) {
      setAspectRatio(image.width / image.height);
    }
  }, [image]);

  useEffect(() => {
    if (!groupRef.current) return;

    const node = groupRef.current;
    const baseX = x - width / 2;
    const baseY = y - (width / aspectRatio)/2;
    let anim: Konva.Animation;

    anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const time = frame.time / 1000;
      const floatAmplitude = Math.min(2.5 / zoomScale, 3.5);
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
  }, [x, y, zoomScale, width, aspectRatio]);

  if (!image) return null;

  return (
    <Group ref={groupRef}>
      <KonvaImage
        image={image}
        width={width}
        height={width / aspectRatio}
      />
      {note && (
        <Text
          text={"*"+note}
          width={width}
          align="left"
          fill="#ababab"
          fontSize={11}
          fontStyle="italic"
          fontFamily="Helvetica"
          y={width / aspectRatio + 5} // Posición debajo de la imagen
          wrap="word"
          ellipsis={true}
        />
      )}
    </Group>
  );
};

export default Photo;