import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { appRouter } from "@/trpc/routers/_app";
import { createCallerFactory, createTRPCContext } from "@/trpc/init";
import { makeQueryClient } from "@/trpc/query-client";

export const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);
export const {trpc, HydrateClient} = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
