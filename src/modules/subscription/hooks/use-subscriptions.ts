'use client'

import { trpc } from "@/trpc/client"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

interface UseSubscriptionProps {
    userId: string
    isSubscribed: boolean
    fromVideoId?: string
}

export const useSubscription = ({ fromVideoId, isSubscribed, userId }: UseSubscriptionProps) => {
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const subscribe = trpc.subscriptions.subscribe.useMutation({
        onSuccess: () => {
            toast.success(`Subscribed`)
            utils.videos.getManySubscribed.invalidate()
            utils.users.getOneUser.invalidate({ id: userId })
            utils.subscriptions.getManySubscriptions.invalidate()
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId })
            }
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            toast.error(`Something went wrong`)
        }
    })
    const unSubscribe = trpc.subscriptions.unSubscribe.useMutation({
        onSuccess: () => {
            toast.success(`Unsubscribe successfully`)
            utils.videos.getManySubscribed.invalidate()
            utils.users.getOneUser.invalidate({ id: userId })
            utils.subscriptions.getManySubscriptions.invalidate()
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId })
            }
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            toast.error(`Something went wrong`)
        }
    })
    const isPending = subscribe.isPending || unSubscribe.isPending

    const onClick = () => {
        if (isSubscribed) {
            unSubscribe.mutate({ id: userId })
        } else {
            subscribe.mutate(({ id: userId }))
        }
    }

    return { isPending, onClick }
}