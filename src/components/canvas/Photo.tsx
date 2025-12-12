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
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (image) {
      setAspectRatio(image.width / image.height);
    }
  }, [image]);

  if (!image) return null;

  // Calculate font size relative to image width to maintain proportion
  // This ensures text doesn't look huge on small images or tiny on large ones
  const fontSize = Math.max(width * 0.05, 14);
  const height = width / aspectRatio;

  return (
    <Group x={x} y={y}>
      {/* Apply scale to the container group for stable layout */}
      <Group scaleX={zoomScale} scaleY={zoomScale}>
        <FloatingGroup>
          <KonvaImage
            image={image}
            width={width}
            height={height}
            x={-width / 2}
            y={-height / 2}
          />
          {note && (
            <Text
              text={"*" + note}
              width={width}
              align="left"
              fill="#ababab"
              fontSize={fontSize}
              fontStyle="italic"
              fontFamily="Helvetica"
              x={-width / 2}
              y={height / 2 + width * 0.02} // Spacing relative to width
              wrap="word"
              ellipsis={true}
              lineHeight={1.2}
            />
          )}
        </FloatingGroup>
      </Group>
    </Group>
  );
};

// Helper component to handle animation independently
const FloatingGroup = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Randomize start time
    const randomOffset = Math.random() * 100;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const time = frame.time / 1000 + randomOffset;
      // Amplitude is in local units, will be scaled by parent
      const floatAmplitude = 5;
      const floatSpeed = 0.5;

      node.y(Math.sin(time * floatSpeed) * floatAmplitude);
    }, node.getLayer());

    anim.start();
    return () => {
      anim.stop();
    };
  }, []);

  return <Group ref={ref}>{children}</Group>;
};

export default Photo;
