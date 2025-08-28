import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { UserGetOneOutput } from "@/modules/users/type"
import { useAuth } from "@clerk/nextjs"
import { Edit2Icon } from "lucide-react"
import { BannerUploadModal } from "./banner-upload-modal"
import { useState } from "react"

interface UserBannerProps {
    user: UserGetOneOutput
}

export const UserBannerSkeleton = () => {
    return <Skeleton className="w-full max-h-50 h-[20vh] md:h-[30vh]" />
}
export const UserBanner = ({ user }: UserBannerProps) => {
    const [isBannerUploadModalOpen, setIsBannerUploadModalOpen] = useState<boolean>(false)
    const { userId } = useAuth()

    return (
        <div className="group relative">
            <BannerUploadModal
                isOpen={isBannerUploadModalOpen}
                onOpenChange={setIsBannerUploadModalOpen}
                userId={user.id}
            />
            <div className={cn(
                'w-full max-h-50 h-[20vh] md:h-[30vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl',
                user.bannerUrl ? `bg-cover bg-center` : `bg-gray-100`
            )}
                style={{
                    backgroundImage: user.bannerUrl ?
                        `url(${user.bannerUrl})` :
                        undefined
                }}>
                {user.clerkId === userId && (
                    <Tooltip>
                        <TooltipTrigger
                            asChild
                            className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/50
                        opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                            <Button
                                type="button"
                                size={`icon`}
                                onClick={() => setIsBannerUploadModalOpen(true)}
                            >
                                <Edit2Icon className="size-4 text-white" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center" className="bg-black/80">
                            <p>Edit the banner</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

        </div>
    )
}