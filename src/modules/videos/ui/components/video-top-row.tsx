import { VideoGetOneOutput } from "@/modules/videos/types";
import { VideoOwner } from "@/modules/videos/ui/components/video-owner";
import { VideoReactions } from "@/modules/videos/ui/components/video-reactions";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";
import { VideoDescription } from "./video-description";
import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
    video: VideoGetOneOutput
}

export const VideoTopRowSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-4/5 md:w-2/5" />
            </div>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 w-[70%]">
                    <Skeleton className="size-12 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                        <Skeleton className="h-5 w-4/5 md:w-2/6" />
                        <Skeleton className="h-5 w-3/5 md:w-1/5" />
                    </div>
                </div>
                <Skeleton className="h-9 w-2/6 md:w-1/6" />
            </div>
            <Skeleton className="h-30 w-full" />
        </div>
    )
}
export const VideoTopRow = ({ video }: VideoTopRowProps) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat(`en`, {
            notation: `compact`
        }).format(video.viewCount)
    }, [video.viewCount])
    const expandedViews = useMemo(() => {
        return Intl.NumberFormat(`en`, {
            notation: `standard`
        }).format(video.viewCount)
    }, [video.viewCount])
    const compactDate = useMemo(() => {
        return formatDistanceToNow(video.createdAt, { addSuffix: true })
    }, [video.createdAt])
    const expandedDate = useMemo(() => {
        return format(video.createdAt, `d MMM, yyyy`)
    }, [video.createdAt])


    return (
        <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-lg md:text-xl font-semibold">{video.title}</h1>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <VideoOwner user={video.user} videoId={video.id} />
                <div className="flex sm:justify-end gap-2 overflow-x-auto sm:overflow-visible sm:min-w-[calc(50%-6px)] -mb-2 sm:mb-0 pb-2 sm:pb-0">
                    <VideoReactions
                        videoId={video.id}
                        likeCount={video.likeCount}
                        dislikeCount={video.dislikeCount}
                        viwerReaction={video.viewerReaction}
                    />
                    <VideoMenu videoId={video.id} variant="secondary" />

                </div>
            </div>
            <VideoDescription
                compactDate={compactDate}
                compactViews={compactViews}
                expandedDate={expandedDate}
                expandedViews={expandedViews}
                description={video.description}
            />
        </div>
    )
}