import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { ChangeEvent } from "react";
import { FileDetails, ShareFile } from "./ActionsContent";
import { Button } from "./ui/button";
import Image from "next/image";

export default function ActionDialogContent({
  action,
  file,
  name,
  setName,
  setError,
  emailInput,
  error,
  isLoading,
  handleAction,
  closeAllModals,
  handleEmailChange,
  handleRemoveUser,
}: ActionDialogContentProps) {
  if (!action) return null;

  return (
    <DialogContent className="shad-dialog button">
      <DialogHeader className="flex flex-col gap-3">
        <DialogTitle className="text-center text-brand">
          {action.label}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {action.value === "rename" && `Rename your file "${file?.name}"`}
          {action.value === "details" && `View details for "${file?.name}"`}
          {action.value === "share" && `Share "${file?.name}" with others`}
          {action.value === "delete" && `Confirm deletion of "${file?.name}"`}
        </DialogDescription>
        {action.value === "rename" && (
          <Input
            type="text"
            value={name}
            placeholder="Enter new name"
            aria-label="Rename input field"
            className="rename-input-field"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAction();
            }}
          />
        )}
        {action.value === "details" && <FileDetails file={file} />}
        {action.value === "share" && (
          <ShareFile
            file={file}
            email={emailInput}
            onEmailChange={handleEmailChange}
            onRemove={handleRemoveUser}
            handleAction={handleAction}
          />
        )}
        {action.value === "delete" && (
          <p className="delete-confirmation">
            Are you sure you want to delete{" "}
            <span className="delete-file-name">{file.name}</span>?
          </p>
        )}
      </DialogHeader>
      {["rename", "delete", "share"].includes(action.value) && (
        <DialogFooter className="flex !flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Button
              onClick={closeAllModals}
              className="modal-cancel-button"
              aria-label="Cancel action"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className="modal-submit-button"
              aria-label="Submit action"
              disabled={isLoading}
            >
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              <span className="capitalize">
                {isLoading
                  ? `${action.value.slice(0, -1)}ing...`
                  : action.value}
              </span>
            </Button>
          </div>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </DialogFooter>
      )}
    </DialogContent>
  );
}
