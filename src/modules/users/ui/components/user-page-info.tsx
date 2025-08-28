import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/modules/subscription/hooks/use-subscriptions"
import { SubscriptionButton } from "@/modules/subscription/ui/components/subscription-button"
import { UserGetOneOutput } from "@/modules/users/type"
import { useAuth, useClerk } from "@clerk/nextjs"
import Link from "next/link"

interface UserPageInfoProps {
    user: UserGetOneOutput
}

export const UserPageInfoSkeleton = () => {
    return (
        <div className="py-6">
            {/* Mobile layout */}
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-[60px] w-[60px] rounded-full" />
                    <div className="flex-1 min-w-0">
                        <Skeleton className="h-5 w-38 mt-1" />
                        <Skeleton className="h-5 w-32 mt-1" />
                    </div>
                </div>
                <Skeleton className="h-7 w-full rounded-full mt-3" />
            </div>
            {/* Desktop layout */}
            <div className="hidden md:flex items-start gap-4">
                <Skeleton className="size-42 rounded-full" />
                <div className="flex-1 flex-col min-w-0">
                    <Skeleton className="h-6 w-48 mt-4" />
                    <Skeleton className="h-4 w-38 mt-4" />
                    <Skeleton className="h-5 w-34 mt-4" />
                </div>
            </div>
        </div>
    )
}
export const UserPageInfo = ({ user }: UserPageInfoProps) => {
    const { userId, isLoaded } = useAuth()
    const clerk = useClerk()

    const { isPending, onClick } = useSubscription({
        userId: user.id,
        isSubscribed: user.viewerSubscribed,
    })

    return (
        <div className="py-6">
            {/* Mobile layout */}
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        size={`lg`}
                        imageUrl={user.imageUrl}
                        name={user.name}
                        className="h-[60px] w-[60px]"
                        onclick={() => {
                            if (user.clerkId === userId) {
                                clerk.openUserProfile()
                            }
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold mt-1">{user.name}</h1>
                        <div className="flex items-center gap-x-1 text-xs text-muted-foreground mt-1">
                            <span>{user.subscriberCount} subscribers</span>
                            <span>&bull;</span>
                            <span>{user.videoCount} videos</span>
                        </div>
                    </div>
                </div>
                {userId === user.clerkId ? (
                    <Button
                        asChild
                        variant={`secondary`}
                        className="w-full rounded-full mt-3"
                    >
                        <Link prefetch href={`/studio`}> Go to studio</Link>
                    </Button>
                ) : (
                    <SubscriptionButton
                        disabled={isPending || !isLoaded}
                        isSubscribed={user.viewerSubscribed}
                        onClick={onClick}
                        className="w-full mt-3"
                    />
                )}
            </div>
            {/* Desktop layout */}
            <div className="hidden md:flex items-start gap-4">
                <UserAvatar
                    size={`xl`}
                    imageUrl={user.imageUrl}
                    name={user.name}
                    className={cn(
                        userId === user.clerkId && `cursor-pointer hover:opacity-80 transition-opacity duration-300`
                    )}
                    onclick={() => {
                        if (user.clerkId === userId) {
                            clerk.openUserProfile()
                        }
                    }}
                />
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold mt-1">{user.name}</h1>
                    <div className="flex items-center gap-x-1 text-sm text-muted-foreground mt-2">
                        <span>{user.subscriberCount} subscribers</span>
                        <span>&bull;</span>
                        <span>{user.videoCount} videos</span>
                    </div>
                    {userId === user.clerkId ? (
                        <Button
                            asChild
                            variant={`secondary`}
                            className="rounded-full mt-3"
                        >
                            <Link prefetch href={`/studio`}> Go to studio</Link>
                        </Button>
                    ) : (
                        <SubscriptionButton
                            disabled={isPending || !isLoaded}
                            isSubscribed={user.viewerSubscribed}
                            onClick={onClick}
                            className="mt-3"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}