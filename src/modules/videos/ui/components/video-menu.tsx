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
}

export const VideoMenu = ({ videoId, onRemove, variant = `ghost` }: VideoMenuProps) => {
    const [openPlaylistModal, setOpenPlaylistModal] = useState<boolean>(false)
    // TODO: change if deploying outside vercel
    const onShare = () => {
        const fullUrl = `${APP_URL}/videos/${videoId}`;
        navigator.clipboard.writeText(fullUrl)
        toast.success(`Link copied to the clipboard`)
    }

    return (
        <>
            <PlaylistAddModal
                videoId={videoId}
                isOpen={openPlaylistModal}
                onOpenChange={setOpenPlaylistModal}
            />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant={variant} size={`icon`} className="rounded-full">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={onShare} className="cursor-pointer">
                        <ShareIcon className="mr-2 size-4" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setOpenPlaylistModal(true) }} className="cursor-pointer">
                        <ListPlusIcon className="mr-2 size-4" />
                        Add to playlist
                    </DropdownMenuItem>
                    {onRemove && (
                        <DropdownMenuItem onClick={onRemove} className="cursor-pointer">
                            <Trash2Icon className="mr-2 size-4" />
                            Remove from playlist
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}