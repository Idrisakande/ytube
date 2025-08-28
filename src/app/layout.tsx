import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  // SignInButton,
  // SignUpButton,
  // SignedIn,
  // SignedOut,
  // UserButton,
} from "@clerk/nextjs";
import { TrpcProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import ReduxStoreProvider from "@/lib/redux/redux-provider";
// import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YTube Website Application",
  description: "Created to Upload videos, Edit videos with generated AI ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/"}>
      <html lang="en">
        <body className={inter.className}>
          <ReduxStoreProvider>
            <TrpcProvider>
              <Toaster />
              {children}
            </TrpcProvider>
          </ReduxStoreProvider>
          {/* <SignedIn>
            <UserButton />
          </SignedIn> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
