import { UserPageSection } from "@/modules/users/ui/sections/user-page-section"
import { UserVideosSection } from "@/modules/users/ui/sections/user-videos-section"

interface UserViewProps {
    userId: string
}


export const UserView = ({ userId }: UserViewProps) => {
    return (
        <div className="flex flex-col gap-y-6 px-4 pt-2.5 max-w-325 mx-auto mb-2">
            <UserPageSection userId={userId} />
            <UserVideosSection userId={userId} />
        </div>
    )
}