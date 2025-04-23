"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { usePathname } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { useFileUploader } from "@/hooks/useFileUploader";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useUser } from "@/context/UserContext";

export default function FileUploader({ className }: { className?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const showErrorToast = useErrorToast();
  const path = usePathname();
  const { currentUser } = useUser();
  const { $id: ownerId, accountId } = currentUser;

  const clearUploads = (fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileName)
    );
  };

  const { uploadFiles } = useFileUploader({
    ownerId,
    accountId,
    path,
    onFileProcessed: clearUploads,
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 10) {
      showErrorToast("You can upload a maximum of 10 files at a time.");
      return;
    }

    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showErrorToast("File is too large. Max file size allowed - 45MB.");
        return false;
      }
      return true;
    });

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    await uploadFiles(validFiles);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} aria-label="File upload input" />
      <Button
        type="button"
        className={cn("uploader-button", className)}
        onClick={open}
        aria-label="Click to open file picker to upload files"
      >
        <Image
          src="/assets/icons/upload.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
        <p className="h5">Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list" aria-label="Uploading files list">
          <h4 className="h4">Uploading...</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${index}-${file.name}`}
                className="uploader-preview-item"
                aria-label={`Uploading ${file.name}`}
              >
                <div className="uploader-preview-thumbnail">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                    alt={`Thumbnail for ${file.name}`}
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
