import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const item = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Trending",
    url: "/feed/trending",
    icon: FlameIcon,
  },
  {
    title: "Subscriptions",
    url: "/feed/subscribed",
    icon: PlaySquareIcon,
    auth: true,
  },
];

export const MainItems = () => {
  const clerk = useClerk();
  // const { userId } = clerk.user;
  const { isSignedIn } = useAuth();
  const pathname = usePathname()
  // const { signIn } = useSignIn();
  // const isAuth = !!userId;
  // const filteredItems = item.filter((i) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {item.map((i) => (
            <SidebarMenuItem key={i.title}>
              <SidebarMenuButton
                tooltip={i.title}
                asChild
                isActive={pathname === i.url}
                onClick={(event) => {
                  if (!isSignedIn && i.auth) {
                    event.preventDefault();
                    return clerk.openSignIn();
                    // signIn?.redirectToSignIn({
                    //   redirectUrl: "/",
                    // });
                  }
                }}
              >
                {/* Link to the main */}
                <Link prefetch href={i.url} className="flex items-center gap-4">
                  <i.icon />
                  <span className="text-sm">{i.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
