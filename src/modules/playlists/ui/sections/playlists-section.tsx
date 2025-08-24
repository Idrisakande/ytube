"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constant";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PlaylistGridCard, PlaylistGridCardSkeleton } from "@/modules/playlists/ui/components/playlist-grid-card"

export const PlaylistsSection = () => {
    return (
        <Suspense fallback={<PlaylistsSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <PlaylistsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};
const PlaylistsSkeleton = () => {
    return (
        <div className="gap-4 gap-y-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
            {Array.from({ length: 18 })
                .map((_, index) => (
                    <PlaylistGridCardSkeleton key={index} />
                ))}
        </div>
    )
};
const PlaylistsSectionSuspense = () => {
    const [playlists, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.playlists.getManyPlaylists.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor
        })

    return (
        <>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
                {playlists.pages
                    .flatMap((page) => page.data)
                    .map((playlist) => (
                        <PlaylistGridCard key={playlist.id} data={playlist} />
                    ))}

            </div>

            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </>
    )
};
