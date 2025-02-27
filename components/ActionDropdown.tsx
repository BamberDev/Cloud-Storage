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
import { useEffect, useState } from "react";
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
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name.replace(/\.[^/.]+$/, ""));
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const path = usePathname();
  const isOwner = file.owner.$id === currentUser.$id;

  const closeAllModals = () => {
    if (action?.value === "share") {
      setEmailInput("");
      setEmailError(null);
    } else {
      setIsModalOpen(false);
      setIsDropDownOpen(false);
      setAction(null);
      setName(file.name);
    }
  };

  useEffect(() => {
    if (file.name) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, [file.name]);

  const handleAction = async () => {
    if (!action || !isOwner) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setRenameError("Name cannot be empty");
          return false;
        }
        if (trimmedName.length > 200) {
          setRenameError("Name cannot exceed 200 characters");
          return false;
        }
        return renameFile({
          fileId: file.$id,
          name: trimmedName,
          extension: file.extension,
          path,
        });
      },
      share: () => {
        const emailSchema = z.string().email("Invalid email address");
        const result = emailSchema.safeParse(emailInput);
        if (!result.success) {
          setEmailError("Invalid email address");
          setIsLoading(false);
          return false;
        }
        return updateFileUsers({
          fileId: file.$id,
          emails: Array.from(new Set([...file.users, emailInput])),
          path,
        });
      },
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    if (!isOwner) return;
    const updatedEmails = file.users.filter((e: string) => e !== email);
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) {
      file.users = updatedEmails;
    }
  };

  const handleEmailChange = (email: string) => {
    setEmailInput(email);
    setEmailError(null);
  };

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
                  setRenameError(null);
                }}
              />
              {renameError && <p className="error-message">{renameError}</p>}
            </>
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareFile
              file={file}
              email={emailInput}
              onEmailChange={handleEmailChange}
              onRemove={handleRemoveUser}
              error={emailError}
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
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
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
