import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchForge AI — Voice Deployment Proof",
  description:
    "A deployment control plane for reliable AI agents: tools, evals, traces, launch gates and ROI evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
