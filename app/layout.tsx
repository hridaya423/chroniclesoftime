import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronicles of Time",
  description: "Echoes of Yesterday, Whispers of Tomorrow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
