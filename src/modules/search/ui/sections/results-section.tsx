"use client"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { DEFAULT_LIMIT } from "@/constant"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface ResultsSectionProps {
    query: string | undefined
    categoryId: string | undefined
}

export const ResultsSection = ({ categoryId, query }: ResultsSectionProps) => {
    return (
        <Suspense
            key={`${query}-${categoryId}`}
            fallback={<ResultsSectionSkeleton />}
        >
            <ErrorBoundary fallback={<p>Error...</p>}>
                <ResultsSectionSuspense categoryId={categoryId} query={query} />
            </ErrorBoundary>
        </Suspense>
    )
}
const ResultsSectionSkeleton = () => {
    return (
        <div>
            <div className="hidden md:flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} />
                ))}
            </div>
            <div className="flex flex-col gap-4 gap-y-8 md:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}
const ResultsSectionSuspense = ({ categoryId, query }: ResultsSectionProps) => {
    const [results, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.search.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
        categoryId,
        query
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-8 md:hidden">
                {results.pages
                    .flatMap((page) => page.data)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))}
            </div>
            <div className="hidden md:flex flex-col gap-4">
                {results.pages
                    .flatMap((page) => page.data)
                    .map((video) => (
                        <VideoRowCard key={video.id} data={video} />
                    ))}
            </div>
            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </>
    )
}