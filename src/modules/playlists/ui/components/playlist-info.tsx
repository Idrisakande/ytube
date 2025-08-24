import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistGetManyOutput } from "@/modules/playlists/types";


interface PlaylistInfoProps {
    data: PlaylistGetManyOutput[`data`][number]
}

export const PlaylistInfoSkeleton = () => {
    return (
        <div className="flex gap-2">
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[40%]" />
                <Skeleton className="h-4 w-[65%]" />
            </div>
        </div>
    )
}
export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
    return (
        <div className="flex gap-2">
            <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium line-clamp-1 lg:line-clamp-2 break-words">
                    {data.name}
                </h3>
                <div className="text-sm text-muted-foreground">Playlist</div>
                <div className="text-sm text-muted-foreground font-semibold hover:text-primary">
                    View full playlist
                </div>
            </div>
        </div>
    )
}