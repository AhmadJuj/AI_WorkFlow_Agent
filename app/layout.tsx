import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Query } from "@tanstack/react-query";
import QueryProvider from "@/context/query-provider";

const DM_SANS = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});
export const metadata: Metadata = {
  title: "Ai Agent Worflow",
  description: "Ai Agent Worflow Builder",
  icons: {
    icon: "/ai-tab-icon.svg",
    shortcut: "/ai-tab-icon.svg",
    apple: "/ai-tab-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${DM_SANS.variable} ${DM_SANS.variable} antialiased`}
      >
        <QueryProvider>

         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
            </QueryProvider>
      </body>
    </html>
  );
}
