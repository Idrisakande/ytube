import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { VIDEO_THUMBNAIL_URL_FALLBACK } from "@/modules/videos/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoThumbnailProps {
    thumbnailUrl?: string | null;
    previewUrl?: string | null;
    title: string;
    duration: number; // Duration in milliseconds, optional
}

export const VideoThumbnailSkeleton = () => {
    return (
        <div className="aspect-video w-full rounded-xl relative overflow-hidden">
            <Skeleton className="size-full" />
        </div>
    )
}
export const VideoThumbnail = ({ thumbnailUrl, previewUrl, title, duration }: VideoThumbnailProps) => {
    return (
        <div className="relative group">
            {/* Thumbnail wrapper */}
            <div className="relative aspect-video w-full bg-muted rounded-xl overflow-hidden">
                {/* Thumbnail image */}
                <Image
                    src={thumbnailUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                    alt={title || "Video-Thumbnail"}
                    fill
                    sizes="100%"
                    priority
                    className="object-cover size-full group-hover:opacity-0 transition-opacity duration-300"
                />
                {/* Preview image */}
                <Image
                    unoptimized={!!previewUrl}
                    src={previewUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                    alt={title || "Video-Preview"}
                    fill
                    sizes="100%"
                    priority
                    className="object-cover size-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    {formatDuration(duration)}
                </div>
            </div>
        </div>
    )
}