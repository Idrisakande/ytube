import { VideosPlaylistHeaderSection } from "@/modules/playlists/ui/sections/videos_playlist_header_section";
import { VideosPlaylistSection } from "@/modules/playlists/ui/sections/videos-playlist-section";

interface VideosPlaylistViewProps {
    playlistId: string
}

export const VideosPlaylistView = ({ playlistId }: VideosPlaylistViewProps) => {
    return (
        <div className="max-w-screen-md mx-auto mb-2 px-4 pt-2.5 flex flex-col gap-y-6">
            <VideosPlaylistHeaderSection playlistId={playlistId} />
            <VideosPlaylistSection playlistId={playlistId} />

        </div>
    );
};
