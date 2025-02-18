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
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface LogoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export default function LogoutDialog({
  trigger,
  isOpen,
  onOpenChange,
}: LogoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      onOpenChange(false);
      router.push("/sign-in");
    } catch {
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to sign out. Please try again.
          </p>
        ),
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            Confirm
          </DialogTitle>
          <DialogDescription className="text-center text-[16px] text-light-100">
            Are you sure you want to sign out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button
            className="modal-cancel-button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="modal-submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
                Signing out...
              </>
            ) : (
              "Sign out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
