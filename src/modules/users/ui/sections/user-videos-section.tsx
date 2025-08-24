"use client"

import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { DEFAULT_LIMIT } from "@/constant"

interface UserVideosSectionProps {
    userId: string
}

export const UserVideosSection = ({ userId }: UserVideosSectionProps) => {
    return (
        <Suspense fallback={<UserVideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <UserVideosSectionSuspense userId={userId} />
            </ErrorBoundary>
        </Suspense>
    )
}
const UserVideosSectionSkeleton = () => {
    return (
        <div className="gap-4 gap-y-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
        xl:grid-cols-3 2xl:grid-cols-4 ">
            {Array.from({ length: 12 })
                .map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
        </div>
    )
}
const UserVideosSectionSuspense = ({ userId }: UserVideosSectionProps) => {
    const [videos, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.videos.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
        userId
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor
        })
    return (
        <div>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
            xl:grid-cols-3 2xl:grid-cols-4 pb-2">
                {videos.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoGridCard key={video.id} data={video} />
                        )))}
            </div>
            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </div>
    )
}