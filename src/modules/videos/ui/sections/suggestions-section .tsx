'use client'

import { DEFAULT_LIMIT } from "@/constant"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { InfiniteScroll } from "@/components/infinite-scroll"

interface SuggestionsSectionProps {
    videoId: string
    isManuallyTriggered?: boolean
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
    return (
        <Suspense fallback={<SuggestionsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <SuggestionsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}
const SuggestionsSectionSkeleton = () => {
    return (
        <>
            <div className="hidden md:block space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} size={`compact`} />
                ))}
            </div>
            <div className="block md:hidden space-y-6">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </>
    )
}
const SuggestionsSectionSuspense = ({ videoId, isManuallyTriggered }: SuggestionsSectionProps) => {
    const [suggestions, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId
    }, {
        getNextPageParam: (lastPage => lastPage.nextCursor)
    })

    return (
        <>
            <div className="hidden md:flex flex-col gap-y-1">
                {suggestions.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoRowCard
                                key={video.id}
                                data={video}
                                size={`compact`}
                            />
                        )))}
            </div>
            <div className="block md:hidden space-y-6">
                {suggestions.pages
                    .flatMap((page) => page.data
                        .map((video) => (
                            <VideoGridCard
                                key={video.id}
                                data={video}
                            />
                        )))}
            </div>
            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isManuallyTriggered={isManuallyTriggered}
            />
        </>
    )
}