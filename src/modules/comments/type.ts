import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";


export type CommentGetManyOutput =
    inferRouterOutputs<AppRouter>[`comments`][`getMany`]

export type CommentGetOneOutput =
    inferRouterOutputs<AppRouter>[`comments`][`getMany`][`data`][0][`viewerReactions`]