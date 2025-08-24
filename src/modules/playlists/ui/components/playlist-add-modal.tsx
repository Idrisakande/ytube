import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constant";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
    videoId: string
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export const PlaylistAddModal = ({ isOpen, onOpenChange, videoId }: PlaylistAddModalProps) => {
    const { data: playlist, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = trpc.playlists.getManyPlaylistsForVideo.useInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && isOpen
    })
    const utils = trpc.useUtils()

    const addVideoToPlaylist = trpc.playlists.addVideoToPlaylist
        .useMutation({
            onSuccess: (data) => {
                toast.success("Video added to playlist");
                utils.playlists.getManyPlaylists.invalidate()
                utils.playlists.getManyPlaylistsForVideo.invalidate({ videoId })
                utils.playlists.getOnePlaylist.invalidate({ id: data.playlistId })
                utils.playlists.getVideosFromPlaylist.invalidate({ playlistId: data.playlistId })
            },
            onError: () => {
                toast.error(`Something went wrong`)
            }
        });
    const removeVideoFromPlaylist = trpc.playlists.removeVideoFromPlaylist
        .useMutation({
            onSuccess: (data) => {
                toast.success("Video removed from playlist");
                utils.playlists.getManyPlaylists.invalidate()
                utils.playlists.getManyPlaylistsForVideo.invalidate({ videoId })
                utils.playlists.getOnePlaylist.invalidate({ id: data.playlistId })
                utils.playlists.getVideosFromPlaylist.invalidate({ playlistId: data.playlistId })
            },
            onError: () => {
                toast.error(`Something went wrong`)
            }
        });


    return (
        <ResponsiveModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Add to a playlist"
        >
            <div className="flex flex-col gap-y-2 h-[45vh] md:h-[50vh] overflow-y-scroll">
                {isLoading && (
                    <div className="flex items-center justify-center p-8 h-full">
                        <Loader2Icon className="animate-spin size-6 text-muted-foreground" />
                    </div>
                )}
                {!isLoading &&
                    playlist?.pages
                        .flatMap((page) => page.data)
                        .map((playlist) => (
                            <Button
                                key={playlist.id}
                                variant={`ghost`}
                                size={`lg`}
                                onClick={() => {
                                    if (playlist.containsVideos) {
                                        removeVideoFromPlaylist.mutate({ playlistId: playlist.id, videoId })
                                    } else {
                                        addVideoToPlaylist.mutate({ playlistId: playlist.id, videoId })
                                    }
                                }}
                                disabled={removeVideoFromPlaylist.isPending || addVideoToPlaylist.isPending}
                                className="px-2 w-full justify-start [&_svg]:size-5"
                            >
                                {playlist.containsVideos ?
                                    <SquareCheckIcon className="mr-2" /> :
                                    <SquareIcon className="mr-2 " />}
                                {playlist.name}
                            </Button>
                        ))}

                {!isLoading && (
                    <InfiniteScroll
                        hasNextPage={hasNextPage}
                        fetchNextPage={fetchNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        isManuallyTriggered
                    />
                )}
            </div>
        </ResponsiveModal>
    );
};