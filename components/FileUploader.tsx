"use client";

import { memo, useCallback, useState } from "react";
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

const FileUploader = memo(function FileUploader({
  ownerId,
  accountId,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const showErrorToast = useErrorToast();
  const path = usePathname();

  const clearUploads = useCallback((fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileName)
    );
  }, []);

  const { uploadFiles } = useFileUploader({
    ownerId,
    accountId,
    path,
    onFileProcessed: clearUploads,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
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
    },
    [files, showErrorToast, uploadFiles]
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
          <h4 className="h4">Uploading...</h4>
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
});

export default FileUploader;
