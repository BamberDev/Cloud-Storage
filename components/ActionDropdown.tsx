"use client";

import { Dialog } from "@/components/ui/dialog";
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
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { z } from "zod";
import ActionDialogContent from "./ActionDialogContent";

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

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots icon"
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
                    alt=""
                    width={30}
                    height={30}
                    aria-hidden="true"
                  />
                  {actionItem.value === "download" ? (
                    <Link
                      href={constructDownloadUrl(file.bucketFileId)}
                      target="_blank"
                      download={file.name}
                      className="flex items-center"
                      aria-label="Download file"
                    >
                      {actionItem.label}
                    </Link>
                  ) : (
                    <span>{actionItem.label}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionDialogContent
        action={action}
        file={file}
        name={name}
        emailInput={emailInput}
        error={error}
        isLoading={isLoading}
        setName={setName}
        setError={setError}
        handleAction={handleAction}
        closeAllModals={closeAllModals}
        handleEmailChange={handleEmailChange}
        handleRemoveUser={handleRemoveUser}
      />
    </Dialog>
  );
}
