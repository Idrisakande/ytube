import { DeleteModal } from "@/components/delete-modal"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { APP_URL } from "@/constant"
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal"
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface VideoMenuProps {
    videoId: string
    variant?: `ghost` | `secondary`
    onRemove?: () => void
    removeIsPending?: boolean
}

export const VideoMenu = ({ videoId, onRemove, variant = `ghost`, removeIsPending }: VideoMenuProps) => {
    const [openPlaylistModal, setOpenPlaylistModal] = useState<boolean>(false)
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false)
    // TODO: change if deploying outside vercel
    const onShare = () => {
        const fullUrl = `${APP_URL}/videos/${videoId}`;
        navigator.clipboard.writeText(fullUrl)
        toast.success(`Link copied to the clipboard`)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="">
                    <Button variant={variant} size={`icon`} className="rounded-full cursor-pointer">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={onShare}
                        className="cursor-pointer text-xs">
                        <ShareIcon className="mr-2 size-3" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setOpenPlaylistModal(true) }}
                        className="cursor-pointer text-xs">
                        <ListPlusIcon className="mr-2 size-3" />
                        Add to playlist
                    </DropdownMenuItem>
                    {onRemove && (
                        <DropdownMenuItem variant="destructive"
                            onClick={() => setIsRemoveModalOpen(true)}
                            className="cursor-pointer text-xs">
                            <Trash2Icon className="mr-2 size-3" />
                            Remove from playlist
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <PlaylistAddModal
                videoId={videoId}
                isOpen={openPlaylistModal}
                onOpenChange={setOpenPlaylistModal}
            />
            <DeleteModal
                isOpen={isRemoveModalOpen}
                onOpenChange={setIsRemoveModalOpen}
                title="Remove the video"
                actionText={`Are you sure to remove from playlist?`}
                buttonText={`Remove`}
                onClick={onRemove}
                isPending={removeIsPending}
            />
        </>
    )
}