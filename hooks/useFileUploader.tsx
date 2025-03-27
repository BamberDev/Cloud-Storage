"use client";

import { useCallback } from "react";
import { uploadFile } from "@/lib/actions/file.actions";
import { useErrorToast } from "./useErrorToast";

export function useFileUploader({
  ownerId,
  accountId,
  path,
  onFileProcessed,
}: UseFileUploaderProps) {
  const showErrorToast = useErrorToast();

  const uploadFiles = useCallback(
    async (files: File[]) => {
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
    },
    [ownerId, accountId, path, onFileProcessed, showErrorToast]
  );

  return { uploadFiles };
}
