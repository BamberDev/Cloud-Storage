"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import {
  constructFileUrl,
  getFileType,
  handleError,
  parseStringify,
} from "../utils";
import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import { cache } from "react";

const fallbackFiles = () => {
  return parseStringify({ documents: [] });
};

const fallbackTotalSpace = () => {
  return parseStringify({
    image: { size: 0, latestDate: "" },
    document: { size: 0, latestDate: "" },
    video: { size: 0, latestDate: "" },
    audio: { size: 0, latestDate: "" },
    other: { size: 0, latestDate: "" },
    used: 0,
    all: 1_000_000_000,
  });
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const totalSpaceUsed = await getTotalSpaceUsed({ userId: ownerId });
    const remainingSpace = totalSpaceUsed.all - totalSpaceUsed.used;

    if (file.size > remainingSpace) {
      throw new Error("Storage limit reached.");
    }

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  userId: string,
  userEmail: string,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [userId]),
      Query.contains("users", [userEmail]),
    ]),
  ];

  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }
  if (searchText) {
    queries.push(Query.contains("name", [searchText]));
  }
  if (limit) {
    queries.push(Query.limit(limit));
  }

  const [sortBy, orderBy] = sort.split("-");
  queries.push(
    orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
  );

  return queries;
};

export const getFiles = cache(
  async ({
    types = [],
    searchText = "",
    sort = "$createdAt-desc",
    limit,
    userId,
    userEmail,
  }: GetFilesProps) => {
    const { databases } = await createAdminClient();

    try {
      if (!userId || !userEmail) return fallbackFiles();

      const queries = createQueries(
        userId,
        userEmail,
        types,
        searchText,
        sort,
        limit
      );

      const files = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        queries
      );

      return parseStringify(files);
    } catch (error) {
      handleError(error, "Failed to get files");
      return fallbackFiles();
    }
  }
);

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

export const getTotalSpaceUsed = cache(
  async ({ userId }: { userId: string }) => {
    try {
      const { databases } = await createAdminClient();
      if (!userId) return fallbackTotalSpace();

      const files = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        [Query.equal("owner", [userId])]
      );

      const totalSpace = {
        image: { size: 0, latestDate: "" },
        document: { size: 0, latestDate: "" },
        video: { size: 0, latestDate: "" },
        audio: { size: 0, latestDate: "" },
        other: { size: 0, latestDate: "" },
        used: 0,
        all: 1_000_000_000, // Exactly 1GB (To show it in the chart)
      };

      files.documents.forEach((file) => {
        const fileType = file.type as FileType;
        totalSpace[fileType].size += file.size;
        totalSpace.used += file.size;

        if (
          !totalSpace[fileType].latestDate ||
          new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
        ) {
          totalSpace[fileType].latestDate = file.$updatedAt;
        }
      });

      return parseStringify(totalSpace);
    } catch (error) {
      handleError(error, "Error calculating total space used");
      return fallbackTotalSpace();
    }
  }
);
