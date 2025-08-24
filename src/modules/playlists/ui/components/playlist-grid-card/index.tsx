import { PlaylistGetManyOutput } from "@/modules/playlists/types";
import { VIDEO_THUMBNAIL_URL_FALLBACK } from "@/modules/videos/constants";
import Link from "next/link";
import { PlaylistThumbnail, PlaylistThumbnailSkeleton } from "@/modules/playlists/ui/components/playlist-grid-card/playlist-thumbnail"
import { PlaylistInfo, PlaylistInfoSkeleton } from "@/modules/playlists/ui/components/playlist-info";

interface PlaylistGridCardProps {
    data: PlaylistGetManyOutput[`data`][number]
}

export const PlaylistGridCardSkeleton = () => {

    return (
        <div className="flex flex-col gap-2 w-full group">
            <PlaylistThumbnailSkeleton />
            <PlaylistInfoSkeleton />
        </div>
    )
}
export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {

    return (
        <Link prefetch  href={`/playlists/${data.id}`}>
            <div className="flex flex-col gap-2 w-full group">
                <PlaylistThumbnail
                    thumbnailUrl={data.thumbnailUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                    title={data.name}
                    videoCount={data.videoCount}
                />
                <PlaylistInfo data={data} />
            </div>
        </Link>
    )
}