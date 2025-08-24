"use client"

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "@/modules/playlists/ui/components/playlist-create-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const PlaylistsCreateButton = () => {
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)

    return (
        <>
            <PlaylistCreateModal
                isOpen={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={`outline`}
                        size={`lg`}
                        className="rounded-full cursor-pointer"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <PlusIcon /> Create
                    </Button>
                </TooltipTrigger>
                <TooltipContent align="center" className="bg-black/80">
                    <p>Create a playlist</p>
                </TooltipContent>
            </Tooltip>
        </>
    );
};
