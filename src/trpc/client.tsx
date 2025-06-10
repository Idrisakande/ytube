"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "@/trpc/query-client";
import type { AppRouter } from "@/trpc/routers/_app";

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;
// let clientQueryClientSingleton: QueryClient | null = null;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server environment: create a new QueryClient instance for each request  always
    // This is important to avoid sharing state between requests in SSR
    // and to ensure that each request has its own cache.
    return makeQueryClient();
  }
  //   Browser environment: use the singleton instance to avoid creating multiple instances
  return (clientQueryClientSingleton ??= makeQueryClient());
}
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    // TODO: Modify this to use the correct URL for your production environment
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:3000}`;
    // if (typeof window === "undefined") {
    //     return "http://localhost:3000"
    // }
    // return window.location.origin
  })();
  //   const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  return `${base}/api/trpc`;
}

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  //   const queryClient = useMemo(() => getQueryClient(), []);
  const [trpcClient] = useState(
    () =>
      // {
      // return
      trpc.createClient({
        links: [
          httpBatchLink({
            transformer: superjson,
            // The URL should point to your API endpoint
            url: getUrl(),
            async headers() {
              const headers = new Headers();
              headers.set("x-trpc-source", "nextjs-react");
              return headers;
              // return    {
              //     "x-ssr": "1",
              // };
            },
          }),
        ],
      })
    // }
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
