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
        <DialogTitle className="text-center text-light-100">
          {action.label}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Description of {action.label} dialog
        </DialogDescription>
        {action.value === "rename" && (
          <Input
            type="text"
            value={name}
            placeholder="Enter new name"
            className="rename-input-field"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              setError(null);
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
                {isLoading
                  ? `${action.value.slice(0, -1)}ing...`
                  : action.value}
              </p>
            </Button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </DialogFooter>
      )}
    </DialogContent>
  );
}
