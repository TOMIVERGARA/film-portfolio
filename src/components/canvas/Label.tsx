import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group, Text } from "react-konva";

interface LabelProps {
  x: number;
  y: number;
  width: number;
  zoomScale: number;
  metadata?: {
    name?: string;
    date?: string;
    filmstock?: string;
  };
}

const Label = ({ x, y, width, zoomScale, metadata }: LabelProps) => {
  const groupRef = useRef<any>(null);
  const nameRef = useRef<any>(null);
  const [nameHeight, setNameHeight] = useState(24);

  useEffect(() => {
    if (nameRef.current) {
      setNameHeight(nameRef.current.height());
    }
  }, [metadata?.name, width]);

  useEffect(() => {
    if (!groupRef.current) return;

    const node = groupRef.current;
    const baseX = x - width / 2;
    const baseY = y - 30;
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
  }, [x, y, zoomScale, width]);

  return (
    <Group ref={groupRef}>
      <Text
        text={metadata?.date?.toLowerCase() || "00/00/0000"}
        x={10}
        y={10}
        width={width - 20}
        fill="#ababab"
        fontSize={14}
        fontStyle="bold"
        fontFamily="Helvetica"
      />
      <Text
        ref={nameRef}
        text={metadata?.name?.toLowerCase() || "Untitled Roll"}
        x={10}
        y={30}
        width={width - 20}
        fill="#fff"
        fontSize={24}
        fontStyle="italic bold"
        fontFamily="Helvetica"
      />
      <Text
        text={`${metadata?.filmstock?.toLowerCase() || "Unknown film"}`}
        x={10}
        y={30 + nameHeight + 5}
        width={width - 20}
        fill="#ababab"
        fontSize={12}
        fontFamily="Helvetica"
      />
    </Group>
  );
};

export default Label;
