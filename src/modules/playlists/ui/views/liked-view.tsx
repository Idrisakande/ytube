import { LikedVideosSection } from "@/modules/playlists/ui/sections/liked-videos-section";


export const LikedView = () => {
    return (
        <div className="max-w-screen-md mx-auto mb-2 px-4 pt-2.5 flex flex-col gap-y-6">
            <div>
                <h1 className="text-xl font-bold">My Liked Videos</h1>
                <p className="text-xs text-muted-foreground">Videos you have Liked</p>
            </div>
            <LikedVideosSection />
        </div>
    );
};
