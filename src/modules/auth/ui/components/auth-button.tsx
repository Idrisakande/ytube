"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAuth,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // if (!isLoaded) {
  //   return (
  //     <div className="flex items-center space-x-2">
  //       <Skeleton className="rounded-full size-7"/>
  //     </div>
  //   );
  // }

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
              variant={"outline"}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-500 font-medium rounded-full shadow-none border-blue-500"
            >
              <UserCircleIcon />
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
