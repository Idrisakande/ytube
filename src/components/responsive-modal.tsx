import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface ResponsiveDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title: string;
}

export const ResponsiveModal = ({ isOpen, onOpenChange, title, children }: ResponsiveDialogProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription className="hidden" />
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        );
    }
    // For larger screens, use Dialog
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="hidden"/>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};
