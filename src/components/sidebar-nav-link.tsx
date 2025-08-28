"use client";

import {
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type SidebarNavLinkProps = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    auth?: boolean; // if true → require login
};

export const SidebarNavLink = ({
    title,
    url,
    icon: Icon,
    auth = false,
}: SidebarNavLinkProps) => {
    const pathname = usePathname();
    const clerk = useClerk();
    const { isSignedIn } = useAuth();
    // 🔥 This is the key hook
    const { isMobile, setOpenMobile } = useSidebar();

    const handleClick = (event: React.MouseEvent) => {
        if (auth && !isSignedIn) {
            event.preventDefault();
            return clerk.openSignIn();
        }
        // ✅ Auto close sidebar on mobile after navigation
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const requiresSignIn = auth && !isSignedIn;

    return (
        <SidebarMenuButton
            tooltip={requiresSignIn ? `Sign in view ${title}` : title}
            asChild
            isActive={pathname === url}
            onClick={handleClick}
        >
            <Link prefetch href={url} className="flex items-center gap-4">
                <Icon
                    className={cn(
                        "size-4 shrink-0",
                        requiresSignIn && "opacity-60"
                    )}
                />
                <span
                    className={cn(
                        "text-sm",
                        requiresSignIn && "opacity-70"
                    )}
                >
                    {title}
                </span>
            </Link>
        </SidebarMenuButton>
    );
};
