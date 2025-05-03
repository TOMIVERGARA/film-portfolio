import type { Metadata } from "next";
import "./globals.css";
import { BottomBar } from "@/components/BottomBar";
import { CanvasProvider } from "@/components/CanvasContext";

export const metadata: Metadata = {
  title: "portfolio - tomas vergara",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CanvasProvider>
          {children}
          <BottomBar />
        </CanvasProvider>
      </body>
    </html>
  );
}
