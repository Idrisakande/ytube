import { DEFAULT_LIMIT } from "@/constant"
import { trpc } from "@/trpc/client"
import { CornerDownRightIcon, Loader2Icon } from "lucide-react"
import { CommentItem } from "./comment-item"
import { Button } from "@/components/ui/button"

interface CommentRepliesProps {
    parentId: string
    videoId: string
}

export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = trpc.comments.getMany.useInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId,
        parentId
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })

    return (
        <div className="pl-10">
            <div className="flex flex-col gap-4 mt-1">
                {isLoading && (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
                    </div>
                )}
                {!isLoading &&
                    data?.pages
                        .flatMap((page) => page.data)
                        .map((comment) => (
                            <CommentItem key={comment.id} comment={comment} variant="reply" />
                        ))}
            </div>
            {hasNextPage && (
                isFetchingNextPage ?
                    <div className="flex items-center justify-center w-full">
                        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
                    </div> :
                    <Button
                        variant={"purple_ghost"}
                        size={"xs"}
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="mt-1 cursor-pointer"
                    >
                        <CornerDownRightIcon />
                        Show more replies
                    </Button>
            )}
        </div>
    )
}