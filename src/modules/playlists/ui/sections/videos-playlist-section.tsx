"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constant";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosPlaylistSectionProps {
    playlistId: string
}

export const VideosPlaylistSection = ({ playlistId }: VideosPlaylistSectionProps) => {
    return (
        <Suspense fallback={<VideosPlaylistSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <VideosPlaylistSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    );
};
const VideosPlaylistSectionSkeleton = () => {
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
const VideosPlaylistSectionSuspense = ({ playlistId }: VideosPlaylistSectionProps) => {
    const [videos, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.playlists.getVideosFromPlaylist.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
        playlistId
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor
        })
    const utils = trpc.useUtils()
    const removeVideoFromPlaylist = trpc.playlists.removeVideoFromPlaylist
        .useMutation({
            onSuccess: (data) => {
                toast.success("Video removed from playlist");
                utils.playlists.getManyPlaylists.invalidate()
                utils.playlists.getManyPlaylistsForVideo.invalidate({ videoId: data.videoId })
                utils.playlists.getOnePlaylist.invalidate({ id: data.playlistId })
                utils.playlists.getVideosFromPlaylist.invalidate({ playlistId: data.playlistId })
            },
            onError: () => {
                toast.error(`Something went wrong`)
            }
        });

    return (
        <div>
            <div className="flex flex-col gap-6 md:hidden">
                {videos.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoGridCard
                                key={video.id}
                                data={video}
                                onRemove={() => removeVideoFromPlaylist.mutate({ playlistId, videoId: video.id })} />
                        )))}
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {videos.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoRowCard
                                key={video.id}
                                data={video}
                                size={`compact`}
                                onRemove={() => removeVideoFromPlaylist.mutate({ playlistId, videoId: video.id })} />
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
