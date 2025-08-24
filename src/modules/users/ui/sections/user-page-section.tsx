"use client"

import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { UserBanner, UserBannerSkeleton } from "@/modules/users/ui/components/user-banner"
import { UserPageInfo, UserPageInfoSkeleton } from "@/modules/users/ui/components/user-page-info"
import { Separator } from "@/components/ui/separator"

interface UserPageSectionProps {
    userId: string
}

export const UserPageSection = ({ userId }: UserPageSectionProps) => {
    return (
        <Suspense fallback={<UserPageSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <UserPageSectionSuspense userId={userId} />
            </ErrorBoundary>
        </Suspense>
    )
}
const UserPageSectionSkeleton = () => {
    return (
        <div className='flex flex-col'>
            <UserBannerSkeleton />
            <UserPageInfoSkeleton />
            <Separator />
        </div>
    )
}
const UserPageSectionSuspense = ({ userId }: UserPageSectionProps) => {
    const [user] = trpc.users.getOneUser.useSuspenseQuery({ id: userId })
    return (
        <div className="flex flex-col">
            <UserBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    )
}