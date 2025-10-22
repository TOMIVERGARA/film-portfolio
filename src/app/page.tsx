// pages/page.tsx
import Canvas from "@/components/Canvas/Canvas";
import { BottomBar } from "@/components/BottomBar";
import { icons } from "lucide-react";

export const metadata = {
  title: "portfolio - tv",
  description:
    "a procedurally generated analog photography portfolio by tomás vergara, systems engineering student and film enthusiast.",
};

export default function HomePage() {
  return (
    <div>
      <Canvas />
      <BottomBar />
    </div>
  );
}
