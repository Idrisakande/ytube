import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { SubscriptionButton } from "@/modules/subscription/ui/components/subscription-button"

interface SubscriptionItemProps {
    name: string
    imageUrl: string
    subscriberCount: number
    onUnsubscribe: () => void
    disabled: boolean
}

export const SubscriptionItemSkeleton = () => {
    return (
        <div className="flex items-start gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-20 mt-1" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
        </div>
    )
}
export const SubscriptionItem = ({ disabled, imageUrl, name, onUnsubscribe, subscriberCount }: SubscriptionItemProps) => {
    return (
        <div className="flex items-start gap-4">
            <UserAvatar
                imageUrl={imageUrl}
                name={name}
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm">{name}</h3>
                        <h3 className="text-xs text-muted-foreground">{subscriberCount.toLocaleString()} subscribers</h3>
                    </div>
                    <SubscriptionButton
                        size={`sm`}
                        disabled={disabled}
                        isSubscribed
                        onClick={(e) => {
                            e.preventDefault()
                            onUnsubscribe()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}