import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DELUGE — Flood Intelligence & Evacuation System",
  description:
    "Real-time flood emergency decision-support platform for emergency operations centers.",
};

import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <CommandCenterLayout>
          {children}
        </CommandCenterLayout>
      </body>
    </html>
  );
}
