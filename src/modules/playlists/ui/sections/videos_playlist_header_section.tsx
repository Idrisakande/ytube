"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/trpc/client";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosPlaylistHeaderSectionProps {
    playlistId: string
}

export const VideosPlaylistHeaderSection = ({ playlistId }: VideosPlaylistHeaderSectionProps) => {
    return (
        <Suspense fallback={<VideosPlaylistHeaderSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <VideosPlaylistHeaderSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    );
};
const VideosPlaylistHeaderSkeleton = () => {
    return (
        <div className="flex justify-between items-start">
            <div className='flex flex-col gap-y-1'>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="size-10 rounded-full" />
        </div>
    )
};
const VideosPlaylistHeaderSectionSuspense = ({ playlistId }: VideosPlaylistHeaderSectionProps) => {
    const [playlist] = trpc.playlists.getOnePlaylist.useSuspenseQuery({ id: playlistId })

    const router = useRouter()
    const utils = trpc.useUtils()
    const removePlaylist = trpc.playlists.deletePlaylist.useMutation({
        onSuccess: () => {
            toast.success(`Playlist removed`)
            utils.playlists.getManyPlaylists.invalidate()
            router.push(`/playlists`)
        },
        onError: () => {
            toast.error(`Something went wrong`)
        }
    })

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">Videos from your playlist</p>

            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={`outline`}
                        size={`icon`}
                        disabled={removePlaylist.isPending}
                        onClick={() => removePlaylist.mutate({ id: playlist.id })}
                        className="rounded-full cursor-pointer">
                        <TrashIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent align="center" className="bg-black/80">
                    <p>Delete this playlist</p>
                </TooltipContent>
            </Tooltip>

        </div>
    )
};
