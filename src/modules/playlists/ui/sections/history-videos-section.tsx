"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constant";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const HistoryVideosSection = () => {
    return (
        <Suspense fallback={<HistoryVideosSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <HistoryVideosSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};
const HistoryVideosSkeleton = () => {
    return (
        <>
            <div className="flex flex-col gap-4 gap-y-8 md:hidden">
                {Array.from({ length: 18 })
                    .map((_, index) => (
                        <VideoGridCardSkeleton key={index} />
                    ))}
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {Array.from({ length: 10 })
                    .map((_, index) => (
                        <VideoRowCardSkeleton key={index} size={`compact`} />
                    ))}
            </div>
        </>
    )
};
const HistoryVideosSectionSuspense = () => {
    const [videos, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.playlists.getHistory.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor
        })

    return (
        <div>
            <div className="flex flex-col gap-6 md:hidden">
                {videos.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoGridCard key={video.id} data={video} />
                        )))}
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {videos.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoRowCard key={video.id} data={video} size={`compact`} />
                        )))}
            </div>
            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </div>
    );
};
