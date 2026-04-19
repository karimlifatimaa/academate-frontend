import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Academate — Müəllim Tapın",
  description: "Peşəkar müəllimlərlə birgə hədəflərinizə çatın",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
