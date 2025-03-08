"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareFile } from "./ActionsModalContent";
import { z } from "zod";

export default function ActionDropdown({
  file,
  currentUser,
}: {
  file: Models.Document;
  currentUser: { $id: string };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [action, setAction] = useState<ActionTypeProps | null>(null);
  const [name, setName] = useState(file.name.replace(/\.[^/.]+$/, ""));
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = usePathname();
  const isOwner = file.owner.$id === currentUser.$id;

  const closeAllModals = useCallback(() => {
    if (action?.value === "share") {
      setEmailInput("");
      setError(null);
    } else {
      setIsModalOpen(false);
      setIsDropDownOpen(false);
      setAction(null);
      setName(file.name);
      setError(null);
    }
  }, [action, file.name]);

  useEffect(() => {
    if (isModalOpen) {
      setError(null);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (file.name) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, [file.name]);

  const handleAction = useCallback(async () => {
    if (!action || !isOwner) return;
    setIsLoading(true);
    setError(null);

    try {
      if (action.value === "rename") {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setError("Name cannot be empty");
          return;
        }
        if (trimmedName.length > 200) {
          setError("Name cannot exceed 200 characters");
          return;
        }
        await renameFile({
          fileId: file.$id,
          name: trimmedName,
          extension: file.extension,
          path,
        });
      } else if (action.value === "share") {
        const emailSchema = z.string().email("Invalid email address");
        const result = emailSchema.safeParse(emailInput);
        if (!result.success) {
          setError("Invalid email address");
          return;
        } else if (file.users.includes(emailInput)) {
          setError("This user already has access to the file");
          return;
        }
        await updateFileUsers({
          fileId: file.$id,
          emails: Array.from(new Set([...file.users, emailInput])),
          path,
        });
      } else if (action.value === "delete") {
        await deleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        });
      }

      closeAllModals();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [action, emailInput, file, isOwner, name, path, closeAllModals]);

  const handleRemoveUser = useCallback(
    async (email: string) => {
      if (!isOwner) return;
      setError(null);

      try {
        const updatedEmails = file.users.filter((e: string) => e !== email);
        await updateFileUsers({
          fileId: file.$id,
          emails: updatedEmails,
          path,
        });

        file.users = updatedEmails;
      } catch {
        setError("Failed to remove user. Please try again.");
      }
    },
    [file, path, isOwner]
  );

  const handleEmailChange = useCallback((email: string) => {
    setEmailInput(email);
    setError(null);
  }, []);

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Description of {label} dialog
          </DialogDescription>
          {value === "rename" && (
            <>
              <Input
                type="text"
                value={name}
                placeholder="Enter new name"
                className="rename-input-field"
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </>
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareFile
              file={file}
              email={emailInput}
              onEmailChange={handleEmailChange}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex !flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                onClick={closeAllModals}
                className="modal-cancel-button"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                className="modal-submit-button"
                disabled={isLoading}
              >
                {isLoading && (
                  <Image
                    src="/assets/icons/loader.svg"
                    alt="loader"
                    width={24}
                    height={24}
                    className="animate-spin"
                  />
                )}
                <p className="capitalize">
                  {isLoading ? `${value.slice(0, -1)}ing...` : value}
                </p>
              </Button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems
            .filter(
              (actionItem) =>
                isOwner ||
                !["rename", "share", "delete"].includes(actionItem.value)
            )
            .map((actionItem) => (
              <DropdownMenuItem
                key={actionItem.value}
                className="cursor-pointer py-1"
                onClick={() => {
                  setAction(actionItem);
                  setIsDropDownOpen(false);
                  if (
                    ["rename", "details", "share", "delete"].includes(
                      actionItem.value
                    )
                  ) {
                    setIsModalOpen(true);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.value === "download" ? (
                    <Link
                      href={constructDownloadUrl(file.bucketFileId)}
                      target="_blank"
                      download={file.name}
                      className="flex items-center"
                    >
                      {actionItem.label}
                    </Link>
                  ) : (
                    <p>{actionItem.label}</p>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
}
