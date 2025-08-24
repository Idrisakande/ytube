import { VideoGetManyOutput } from "@/modules/videos/types"
import Link from "next/link"
import { VideoThumbnail, VideoThumbnailSkeleton } from "@/modules/videos/ui/components/video-thumbnail"
import { VideoInfo, VideoInfoskeleton } from "@/modules/videos/ui/components/video-info"

interface VideoGridCardProps {
    data: VideoGetManyOutput[`data`][number]
    onRemove?: () => void
}
export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <VideoThumbnailSkeleton />
            <VideoInfoskeleton />
        </div>
    )
}
export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <Link prefetch  href={`/videos/${data.id}`}>
                <VideoThumbnail
                    thumbnailUrl={data.thumbnailUrl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration}
                />
            </Link>
            <VideoInfo data={data} onRemove={onRemove} />
        </div>
    )
}