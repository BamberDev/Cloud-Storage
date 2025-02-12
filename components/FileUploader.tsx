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

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

export default function FileUploader({ ownerId, accountId, className }: Props) {
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
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          clearUploads(file.name);

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 45MB.
              </p>
            ),
            className: "error-toast",
          });
        }

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
    [toast, ownerId, accountId, path, clearUploads]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement>,
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
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
                <div className="flex items-center w-full max-w-[70%] md:max-w-[325px] subtitle-2">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <p className="ml-2 truncate">{file.name}</p>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Loader2Icon size={24} className="animate-spin" />
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="remove"
                    width={24}
                    height={24}
                    onClick={(e) => handleRemoveFile(e, file.name)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
