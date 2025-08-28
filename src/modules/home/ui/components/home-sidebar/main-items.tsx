import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
import { SidebarNavLink } from "@/components/sidebar-nav-link";

const items = [
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
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((i) => {
            return (
              <SidebarMenuItem key={i.title}>
                <SidebarNavLink {...i} />
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};


// {
//   item.map((i) => (
//     <SidebarMenuItem key={i.title}>
//       <SidebarMenuButton
//         tooltip={i.title}
//         asChild
//         isActive={pathname === i.url}
//         onClick={(event) => {
//           if (!isSignedIn && i.auth) {
//             event.preventDefault();
//             return clerk.openSignIn();
//           }
//         }}
//       >
//         {/* Show main links */}
//         <Link prefetch href={i.url} className="flex items-center gap-4">
//           <i.icon />
//           <span className="text-sm">{i.title}</span>
//         </Link>
//       </SidebarMenuButton>
//     </SidebarMenuItem>
//   ))
// }