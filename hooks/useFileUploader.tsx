"use client";

import { uploadFile } from "@/lib/actions/file.actions";
import { useErrorToast } from "./useErrorToast";

export function useFileUploader({
  ownerId,
  accountId,
  path,
  onFileProcessed,
}: UseFileUploaderProps) {
  const showErrorToast = useErrorToast();

  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      try {
        const uploadedFile = await uploadFile({
          file,
          ownerId,
          accountId,
          path,
        });
        if (uploadedFile) {
          onFileProcessed(file.name);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Storage limit reached."
        ) {
          showErrorToast("Storage limit reached. Unable to upload file.");
        } else {
          showErrorToast("Failed to upload file. Please try again.");
        }
        onFileProcessed(file.name);
      }
    });
    await Promise.all(uploadPromises);
  };

  return { uploadFiles };
}
