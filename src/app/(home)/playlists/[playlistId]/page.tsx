import { DEFAULT_LIMIT } from "@/constant"
import { VideosPlaylistView } from "@/modules/playlists/ui/views/videos-playlist-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface PageProps {
    params: Promise<{ playlistId: string }>
}

const Page = async ({ params }: PageProps) => {
    const { playlistId } = await params
    void trpc.playlists.getVideosFromPlaylist.prefetchInfinite({ limit: DEFAULT_LIMIT, playlistId })
    void trpc.playlists.getOnePlaylist.prefetch({ id: playlistId })

    return (
        <HydrateClient>
            <VideosPlaylistView playlistId={playlistId} />
        </HydrateClient>
    )
}
export default Page