import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { VIDEO_THUMBNAIL_URL_FALLBACK } from "@/modules/videos/constants"
import { ListVideoIcon, PlayIcon } from "lucide-react"
import Image from "next/image"
import { useMemo } from "react"

interface PlaylistThumbnailProps {
    thumbnailUrl?: string | null
    title: string
    videoCount: number
    className?: string
}

export const PlaylistThumbnailSkeleton = () => {
    return (
        <div className="aspect-video w-full rounded-xl relative overflow-hidden">
            <Skeleton className="size-full" />
        </div>
    )
}
export const PlaylistThumbnail = ({ title, videoCount, className, thumbnailUrl }: PlaylistThumbnailProps) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat(`en`, {
            notation: "compact"
        }).format(videoCount)
    }, [videoCount])

    return (
        <div className={cn("relative pt-3", className)}>
            {/* stack effect layers */}
            <div className="relative">
                {/* background layer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl 
                bg-black/20 aspect-video"
                />
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl 
                bg-black/25 aspect-video"
                />
                {/* main image */}
                <div className="relative overflow-hidden w-full rounded-xl aspect-video">
                    <Image
                        src={thumbnailUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                        alt={title}
                        fill
                        className="size-full object-cover"
                    />
                    {/* hover overlay effect */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100
                    transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-x-1">
                            <PlayIcon className="size-4 text-white fill-white" />
                            <span className="text-sm text-white font-medium">Play all</span>
                        </div>

                    </div>
                </div>
            </div>
            {/* Video count badge */}
            <div className="absolute bottom-2 right-2 rounded">
                <Badge className="flex gap-x-1">
                    <ListVideoIcon className="size-4" />
                    {videoCount === 1 ? `${compactViews} video` : `${compactViews} videos`}
                </Badge>

            </div>
        </div>
    )
}