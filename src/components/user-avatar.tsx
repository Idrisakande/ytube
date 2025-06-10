import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const avatarVariants = cva("rounded-full", {
  variants: {
      variant: {
        default:
          "",
        // destructive:
        //   "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // outline:
        //   "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // secondary:
        //   "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // ghost:
        //   "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // link: "text-primary underline-offset-4 hover:underline",
      },
    size: {
      default: "h-9 w-9 ",
      xs: "h-4 w-4 ",
      sm: "h-8 w-8",
      lg: "h-10 w-10 ",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    //   variant: "default",
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl?: string;
  name?: string;
  onclick?: () => void;
  className?: string;
}

export const UserAvatar = ({
  imageUrl,
  name,
  size,
  onclick,
  className,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onclick}
    >
      <AvatarImage src={imageUrl} alt={name} />
    </Avatar>
  );
};
