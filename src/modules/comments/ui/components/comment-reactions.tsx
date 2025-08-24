import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { CommentGetOneOutput } from "@/modules/comments/type"
import { useClerk } from "@clerk/nextjs"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface CommentReactionsProps {
    commentId: string
    likeCount: number
    dislikeCount: number
    viwerReaction: CommentGetOneOutput
    videoId: string
}

export const CommentReactions = ({ dislikeCount, likeCount, commentId, viwerReaction, videoId }: CommentReactionsProps) => {
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const like = trpc.commentReactions.like.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId })
            // TODO: invalidate "liked" playlist
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            toast.error(`Something went wrong`)
        }
    })
    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId })
            // TODO: invalidate "liked" playlist
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            toast.error(`Something went wrong`)
        }
    })

    return (
        <div className="flex items-center flex-none">
            <Button
                size={`icon`}
                variant={`ghost`}
                onClick={() => like.mutate({ id: commentId })}
                disabled={like.isPending || dislike.isPending}
                className="cursor-pointer size-6"
            >
                <ThumbsUpIcon className={cn(`size-4`, viwerReaction === `like` && `fill-black`)} />
            </Button>
            <span className="text-xs text-muted-foreground">{likeCount}</span>
            <Button
                size={`icon`}
                variant={`ghost`}
                onClick={() => dislike.mutate({ id: commentId })}
                disabled={like.isPending || dislike.isPending}
                className="cursor-pointer size-6"
            >
                <ThumbsDownIcon className={cn(`size-4`, viwerReaction === `dislike` && `fill-black`)} />
            </Button>
            <span className="text-xs text-muted-foreground">{dislikeCount}</span>
        </div>
    )
}