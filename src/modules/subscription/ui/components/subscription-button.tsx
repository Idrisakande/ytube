import {
    Button,
    buttonVariants
} from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"


interface SubscriptionButtonProps {
    onClick: React.ComponentProps<"button">['onClick']
    disabled: boolean
    isSubscribed: boolean
    size?: VariantProps<typeof buttonVariants>['size']
    className?: string
}

export const SubscriptionButton = ({ onClick, disabled, isSubscribed, className, size }: SubscriptionButtonProps) => {

    return (
        <Button
            variant={isSubscribed ? `secondary` : `default`}
            size={size}
            disabled={disabled}
            onClick={onClick}
            className={cn(`rounded-full cursor-pointer`, className)}
        >
            {isSubscribed ? `Unsubscribe` : `Subscribe`}
        </Button>
    )
}