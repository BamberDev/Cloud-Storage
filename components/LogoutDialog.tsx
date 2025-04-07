"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useErrorToast } from "@/hooks/useErrorToast";
import Loader from "./Loader";

export default function LogoutDialog({
  trigger,
  isOpen,
  onOpenChange,
}: LogoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const showErrorToast = useErrorToast();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      onOpenChange(false);
      router.push("/sign-in");
    } catch {
      showErrorToast("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-brand">Confirm</DialogTitle>
          <DialogDescription className="text-center text-[16px]">
            Are you sure you want to sign out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button
            className="modal-cancel-button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            aria-label="Cancel sign out"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="modal-submit-button"
            disabled={isLoading}
            aria-label="Confirm sign out"
          >
            {isLoading ? (
              <>
                <Loader />
                Signing Out...
              </>
            ) : (
              "Sign Out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
