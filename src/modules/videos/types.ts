import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VideoGetOneOutput =
    inferRouterOutputs<AppRouter>[`videos`][`getOne`]
    // change to video getMany
export type VideoGetManyOutput =
    inferRouterOutputs<AppRouter>[`suggestions`][`getMany`]