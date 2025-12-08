"use client";

import { useState, useEffect, useRef } from "react";
import { Image as KonvaImage, Text, Group } from "react-konva";
import useImage from "../../hooks/use-image";
import Konva from "konva";

interface PhotoProps {
  url: string;
  x: number;
  y: number;
  width: number;
  zoomScale: number;
  note?: string;
  onImageLoad?: (loadTime: number) => void;
}

const Photo = ({
  url,
  x,
  y,
  width,
  zoomScale,
  note,
  onImageLoad,
}: PhotoProps) => {
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
    // Animation only affects the offset, not the base position
    // We use a separate layer or group for animation if possible,
    // but here we can just add the offset to the 0,0 of the group if the group is positioned by props?
    // Actually, react-konva updates x/y props. If we manually set x/y in animation, it conflicts.
    // Better approach: Use an inner group for animation.
  }, []);

  if (!image) return null;

  // Calculate scaled dimensions
  const scaledWidth = width * zoomScale;
  const scaledHeight = (width / aspectRatio) * zoomScale;
  const fontSize = Math.max(11 * zoomScale, 8); // Prevent text from becoming too small

  return (
    <Group x={x} y={y}>
      {/* Inner group for floating animation */}
      <FloatingGroup zoomScale={zoomScale}>
        <KonvaImage
          image={image}
          width={scaledWidth}
          height={scaledHeight}
          x={-scaledWidth / 2} // Center the image
          y={-scaledHeight / 2}
        />
        {note && (
          <Text
            text={"*" + note}
            width={scaledWidth}
            align="left"
            fill="#ababab"
            fontSize={fontSize}
            fontStyle="italic"
            fontFamily="Helvetica"
            x={-scaledWidth / 2}
            y={scaledHeight / 2 + 5 * zoomScale}
            wrap="word"
            ellipsis={true}
          />
        )}
      </FloatingGroup>
    </Group>
  );
};

// Helper component to handle animation independently
const FloatingGroup = ({
  children,
  zoomScale,
}: {
  children: React.ReactNode;
  zoomScale: number;
}) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const time = frame.time / 1000;
      const floatAmplitude = Math.min(5 * zoomScale, 10); // Scale amplitude with zoom
      const floatSpeed = 0.5;

      // Animate offset relative to parent
      node.y(Math.sin(time * floatSpeed) * floatAmplitude);
    }, node.getLayer());

    anim.start();
    return () => {
      anim.stop();
    };
  }, [zoomScale]);

  return <Group ref={ref}>{children}</Group>;
};

export default Photo;
