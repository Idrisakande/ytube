import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { VideoGetOneOutput } from "../../types"
import { useClerk } from "@clerk/nextjs"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface videoReactionsProps {
    videoId: string
    likeCount: number
    dislikeCount: number
    viwerReaction: VideoGetOneOutput[`viewerReaction`]
}

export const VideoReactions = ({ dislikeCount, likeCount, videoId, viwerReaction }: videoReactionsProps) => {
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const like = trpc.videoReactions.like.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId })
            utils.playlists.getLiked.invalidate()
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
    const dislike = trpc.videoReactions.dislike.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId })
            utils.playlists.getLiked.invalidate()
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
                variant={`secondary`}
                onClick={() => like.mutate({ videoId })}
                disabled={like.isPending || dislike.isPending}
                className="rounded-l-full rounded-r-none pr-4 gap-2 cursor-pointer"
            >
                <ThumbsUpIcon className={cn(`size-5`, viwerReaction === `like` && `fill-black`)} />
                {likeCount}
            </Button>
            <Separator orientation="vertical" className="h-7" />
            <Button
                variant={`secondary`}
                onClick={() => dislike.mutate({ videoId })}
                disabled={like.isPending || dislike.isPending}
                className="rounded-l-none rounded-r-full pr-3 cursor-pointer"
            >
                <ThumbsDownIcon className={cn(`size-5`, viwerReaction === `dislike` && `fill-black`)} />
                {dislikeCount}
            </Button>
        </div>
    )
}