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
  const nameRef = useRef<any>(null);
  const [nameHeight, setNameHeight] = useState(30); // Default height estimate

  // Use a larger base width for text layout to avoid aggressive wrapping
  // We ignore the passed 'width' prop for text layout, treating it as a physics body size only.
  const baseWidth = 400; 
  const padding = 10;

  useEffect(() => {
    if (nameRef.current) {
      // This height is now in "local" unscaled units because the parent group is scaled
      setNameHeight(nameRef.current.height());
    }
  }, [metadata?.name]);

  return (
    <Group x={x} y={y}>
      {/* Apply scale here. This makes all children coordinates 'local' and stable */}
      <Group scaleX={zoomScale} scaleY={zoomScale}>
        <FloatingGroup>
            <Group x={-baseWidth / 2} y={-30}>
                <Text
                    text={metadata?.date?.toLowerCase() || "00/00/0000"}
                    x={padding}
                    y={padding}
                    width={baseWidth - padding * 2}
                    fill="#ababab"
                    fontSize={14}
                    fontStyle="bold"
                    fontFamily="Helvetica"
                    align="left"
                />
                <Text
                    ref={nameRef}
                    text={metadata?.name?.toLowerCase() || "Untitled Roll"}
                    x={padding}
                    y={padding + 20} // Fixed offset for name
                    width={baseWidth - padding * 2}
                    fill="#fff"
                    fontSize={32} // Bigger base font
                    fontStyle="italic bold"
                    fontFamily="Helvetica"
                    align="left"
                    lineHeight={1.1}
                />
                <Text
                    text={`${metadata?.filmstock?.toLowerCase() || "Unknown film"}`}
                    x={padding}
                    y={padding + 20 + nameHeight + 5} // Position based on measured height (unscaled)
                    width={baseWidth - padding * 2}
                    fill="#ababab"
                    fontSize={12}
                    fontFamily="Helvetica"
                    align="left"
                />
            </Group>
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

        // Randomize start time to avoid sync
        const randomOffset = Math.random() * 100;

        const anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const time = frame.time / 1000 + randomOffset;
            const floatAmplitude = 5; // Constant local amplitude (will be scaled by parent)
            const floatSpeed = 0.5;

            node.y(Math.sin(time * floatSpeed) * floatAmplitude);
        }, node.getLayer());

        anim.start();
        return () => { anim.stop(); };
    }, []);

    return <Group ref={ref}>{children}</Group>;
};

export default Label;
