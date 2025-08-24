"use client"

import { PlaylistsSection } from "@/modules/playlists/ui/sections/playlists-section";
import { PlaylistsCreateButton } from "@/modules/playlists/ui/components/playlists-create-button";

export const PlaylistsView = () => {

    return (
        <div className="max-w-[2400px] mx-auto mb-2 px-4 pt-2.5 flex flex-col gap-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">My Playlists</h1>
                    <p className="text-xs text-muted-foreground">Collections you have created</p>
                </div>
                <PlaylistsCreateButton />
            </div>
            <PlaylistsSection />
        </div>
    );
};
