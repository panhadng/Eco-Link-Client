import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "./ApolloWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ThemeInitializer } from "@/components/theme/ThemeInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoLink Social - Connect and Share",
  description: "A modern social network built with Next.js and GraphQL",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground antialiased transition-colors"
        )}
      >
        <ThemeInitializer />
        <ApolloWrapper>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
