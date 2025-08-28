import {
    Button,
    buttonVariants
} from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"


interface SubscriptionButtonProps {
    onClick: React.ComponentProps<"button">['onClick']
    disabled: boolean
    isSubscribed: boolean
    size?: VariantProps<typeof buttonVariants>['size']
    className?: string
    isPending?: boolean
}

export const SubscriptionButton = ({ onClick, disabled, isSubscribed, className, size, isPending }: SubscriptionButtonProps) => {

    return (
        <Button
            variant={isPending || isSubscribed ? `secondary` : `default`}
            size={size}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                `rounded-full cursor-pointer`,
                className,
                isPending && `w-24 flex items-center justify-center`
            )}
        >
            {isPending ? <Loader2Icon className="size-4 animate-spin text-gray-500" /> : isSubscribed ? `Unsubscribe` : `Subscribe`}
        </Button>
    )
}