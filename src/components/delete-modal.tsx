import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2Icon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onClick?: () => void
    isPending?: boolean
    actionText: string
    buttonText: string
}

export const DeleteModal = ({ isOpen, onOpenChange, title, onClick, isPending, buttonText, actionText }: DeleteModalProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        // For moblle screen, use Drawer
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent className="md:hidden pb-2">
                    <DrawerHeader>
                        <DrawerTitle className="text-lg">{title}</DrawerTitle>
                        <DrawerDescription className="hidden" />
                    </DrawerHeader>
                    <div className="flex flex-col px-4">
                        <h1 className="font-medium">
                            {actionText}
                        </h1>
                        <p className="text-sm text-red-500">
                            This action will permanently delete this record and cannot be undone.
                        </p>
                    </div>
                    <DrawerFooter className="flex flex-row items-center justify-center sm:justify-end gap-y-4 w-full">
                        <DrawerClose className={cn(`flex-1 sm:flex-none cursor-pointer sm:min-w-32`,
                            buttonVariants({ variant: `outline`, })
                        )}>Cancel</DrawerClose>
                        <Button
                            variant={"destructive"}
                            disabled={isPending}
                            onClick={onClick}
                            className={cn(`flex-1 sm:flex-none cursor-pointer sm:min-w-32`)}
                        >
                            {isPending ?
                                <div className="flex items-center justify-center">
                                    <Loader2Icon className="animate-spin text-white" />
                                </div> :
                                <><TrashIcon />{buttonText}</>}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }
    // For larger screens, use Dialog
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="hidden md:block space-y-4">
                <DialogHeader>
                    <DialogTitle className="text-lg">{title}</DialogTitle>
                    <DialogDescription className="hidden" />
                </DialogHeader>
                <div className="flex flex-col">
                    <h1 className="font-medium">
                        {actionText}
                    </h1>
                    <p className="text-sm text-red-500">
                        This action will permanently delete this record and cannot be undone.
                    </p>
                </div>
                <DialogFooter className="flex items-center justify-end">
                    <DialogClose className={cn(`w-fit cursor-pointer min-w-28`,
                        buttonVariants({ variant: `outline`, })
                    )}>Cancel</DialogClose>
                    <Button
                        variant={"destructive"}
                        disabled={isPending}
                        onClick={onClick}
                        className={cn(`w-fit cursor-pointer min-w-28`)}
                    >

                        {isPending ?
                            <div className="flex items-center justify-center w-full">
                                <Loader2Icon className="animate-spin text-white" />
                            </div> :
                            <><TrashIcon />{buttonText}</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}