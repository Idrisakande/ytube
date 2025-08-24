import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();

  // If user is not loaded yet, show a skeleton
  if (!user) {
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[112px] rounded-full" />
        <div className="flex flex-col items-center mt-2 gap-y-2.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </SidebarHeader>
    );
  }
  // If user is loaded, show the user profile
  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={"Your Profile"} asChild>
          <Link prefetch  href={`/users/current`}>
            <UserAvatar
              imageUrl={user?.imageUrl}
              name={user?.firstName ?? `User`}
              size={"xs"}
            />
            <span className="sr-only">
              Your Profile - {user?.firstName} {user?.lastName}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  // If sidebar is expanded, show the full profile
  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Link prefetch  href={`/users/current`}>
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user?.firstName ?? `User`}
          className="size-[112px] hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex flex-col items-center mt-2 gap-y-0.5">
        <p className="text-sm font-medium">Your Profile</p>
        <p className="text-sm text-muted-foreground">
          {user?.fullName || `${user?.firstName} ${user?.lastName}`}
        </p>
      </div>
    </SidebarHeader>
  );
};
