import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/modules/subscription/hooks/use-subscriptions"
import { SubscriptionButton } from "@/modules/subscription/ui/components/subscription-button"
import { UserInfo } from "@/modules/users/ui/components/user-info"
import { VideoGetOneOutput } from "@/modules/videos/types"
// import {} from `@/modules/subscription/ui/components/subscription-button`
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"

interface VideoOwnerProps {
    user: VideoGetOneOutput[`user`]
    videoId: string
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
    const { userId: clerkUserId, isLoaded } = useAuth()

    const { isPending, onClick } = useSubscription({
        fromVideoId: videoId,
        isSubscribed: user.viewerSubscribed,
        userId: user.id
    })

    return (
        <div className="min-w-0 flex items-center sm:items-start justify-between sm:justify-start gap-3">
            <Link prefetch href={`/users/${user.id}`}>
                <div className="min-w-0 md:min-w-40 lg:min-w-0 flex items-center gap-3">
                    <UserAvatar size={`lg`} imageUrl={user.imageUrl} name={user.name} />
                    <div className="flex flex-col gap-y-0 min-w-0">
                        <UserInfo name={user.name} size={`lg`} />
                        <span className="text-sm text-muted-foreground line-clamp-1">
                            {/* TODO fill subscribers i furture */}
                            {user.subscriberCount} Subscribers
                        </span>
                    </div>
                </div>
            </Link>
            {clerkUserId === user.clerkId ? (
                <Button
                    variant={`secondary`}
                    asChild
                    className="rounded-full">
                    <Link prefetch
                        href={`/studio/videos/${videoId}`}
                    >Edit video
                    </Link>
                </Button>) : (
                <SubscriptionButton
                    disabled={isPending || !isLoaded}
                    isSubscribed={user.viewerSubscribed}
                    onClick={onClick}
                    className={cn(`flex-none`)}
                    isPending={isPending}
                />
            )}
        </div>
    )
}