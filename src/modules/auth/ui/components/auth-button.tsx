"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, SignInButton, SignedIn, SignedOut, UserButton, } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react";

export const AuthButton = () => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <>
      {!isLoaded ? (
        <div className="flex items-center space-x-2">
          <Skeleton className="rounded-full size-7" />
        </div>
      ) : !isSignedIn ? (
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant={"purple_ghost"}
              className="px-4 py-2 text-sm font-medium rounded-full shadow-none cursor-pointer"
            >
              <UserCircleIcon className="hidden md:block" />
              {/* <User/> */}
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      ) : (
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                href={`/users/current`}
                label={`My profile`}
                labelIcon={<UserIcon className="size-4" />}
              />
              <UserButton.Link
                href={`/studio`}
                label={`Studio`}
                labelIcon={<ClapperboardIcon className="size-4" />}
              />
              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>

      )}
    </>
  );
};
