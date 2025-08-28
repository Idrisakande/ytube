import { UserAvatar } from "@/components/user-avatar"
import { UserInfo } from "@/modules/users/ui/components/user-info"
import { VideoGetManyOutput } from "@/modules/videos/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"
import { VideoMenu } from "./video-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoInfoProps {
    data: VideoGetManyOutput[`data`][number]
    onRemove?: () => void
    removeIsPending?: boolean
}
export const VideoInfoskeleton = () => {
    return (
        <div className="flex gap-2">
            <Skeleton className="size-10 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-5 w-[90%]" />
                <Skeleton className="h-5 w-[70%]" />
            </div>
        </div>
    )
}
export const VideoInfo = ({ data, onRemove, removeIsPending }: VideoInfoProps) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat(`en`, {
            notation: "compact"
        }).format(data.viewCount)
    }, [data.viewCount])
    const compactDate = useMemo(() => {
        return formatDistanceToNow(data.createdAt, { addSuffix: true })
    }, [data.createdAt])

    return (
        <div className="flex gap-2">
            <Link prefetch href={`/users/${data.user.id}`}>
                <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
            </Link>
            <div className="min-w-0 flex-1">
                <Link prefetch href={`/videos/${data.id}`}>
                    <h3 className="text-sm font-semibold text-gray-700 break-words line-clamp-1 lg:line-clamp-2">
                        {data.title}
                    </h3>
                </Link>
                <Link prefetch href={`/users/${data.user.id}`}>
                    <UserInfo name={data.user.name} />
                </Link>
                <Link prefetch href={`/videos/${data.id}`}>
                    <p className="text-sm text-gray-600 line-clamp-1">
                        {compactViews} views &bull; {compactDate}
                    </p>
                </Link>
            </div>
            <div className="flex-shrink-0">
                <VideoMenu
                    videoId={data.id}
                    onRemove={onRemove}
                    removeIsPending={removeIsPending} />
            </div>
        </div>
    )
}