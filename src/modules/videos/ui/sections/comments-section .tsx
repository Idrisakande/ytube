'use client'

import { InfiniteScroll } from "@/components/infinite-scroll"
import { DEFAULT_LIMIT } from "@/constant"
import { CommentForm } from "@/modules/comments/ui/components/comment-form"
import { CommentItem } from "@/modules/comments/ui/components/comment-item"
import { trpc } from "@/trpc/client"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface CommentsSectionProps {
    videoId: string
}

const CommentsSectionSkeleton = () => {
    return (
        <div className='flex items-center justify-center mt-6'>
            <Loader2Icon className="animate-spin text-muted-foreground size-7" />
        </div>
    )
}
const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
    const [comments, { fetchNextPage, hasNextPage, isFetchingNextPage, }] = trpc.comments.getMany.useSuspenseInfiniteQuery({
        videoId,
        limit: DEFAULT_LIMIT
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <h1 className="text-lg font-bold">{comments.pages[0].totalCount} Comments</h1>
                <CommentForm videoId={videoId} />
                <div className="flex flex-col gap-4 mt-4">
                    {comments.pages.flatMap((page) =>
                        page.data).map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                            />
                        ))}
                    <InfiniteScroll
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        isManuallyTriggered
                    />
                </div>
            </div>
        </div>
    )
}
export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
    return (
        <Suspense fallback={<CommentsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <CommentsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}