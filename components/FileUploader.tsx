"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { Loader2Icon } from "lucide-react";

export default function FileUploader({
  ownerId,
  accountId,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const path = usePathname();

  const clearUploads = useCallback((fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileName)
    );
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > 10) {
        toast({
          description: (
            <p className="body-2 text-white">
              You can upload a maximum of 10 files at once.
            </p>
          ),
          className: "error-toast",
        });
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            description: (
              <p className="body-2 text-white">
                File is too large. Max file size allowed - 45MB.
              </p>
            ),
            className: "error-toast",
          });
          return false;
        }
        return true;
      });

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);

      const uploadPromises = validFiles.map(async (file) => {
        try {
          const uploadedFile = await uploadFile({
            file,
            ownerId,
            accountId,
            path,
          });
          if (uploadedFile) {
            clearUploads(file.name);
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Storage limit reached."
          ) {
            toast({
              description: (
                <p className="body-2 text-white">
                  Storage limit reached. Unable to upload file.
                </p>
              ),
              className: "error-toast",
            });
          } else {
            toast({
              description: (
                <p className="body-2 text-white">
                  Failed to upload file. Please try again.
                </p>
              ),
              className: "error-toast",
            });
          }
          clearUploads(file.name);
        }
      });

      await Promise.all(uploadPromises);
    },
    [toast, ownerId, accountId, path, clearUploads, files]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        type="button"
        className={cn("uploader-button", className)}
        onClick={open}
      >
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        <p className="h5">Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading...</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${index}-${file.name}`}
                className="uploader-preview-item"
              >
                <div className="uploader-preview-thumbnail">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <p className="ml-2 truncate">{file.name}</p>
                </div>
                <Loader2Icon size={24} className="animate-spin" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
