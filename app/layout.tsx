import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchForge AI",
  description: "Production OS for AI deployments",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
