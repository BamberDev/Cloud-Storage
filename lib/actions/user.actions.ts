"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import {
  handleError,
  parseStringify,
  TEST_EMAILS,
  TEST_PASSWORDS,
} from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? parseStringify(result.documents[0]) : null;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return parseStringify(session.userId);
  } catch (error) {
    handleError(error, "Failed to create email token");
  }
};

export const createAccount = async ({
  username,
  email,
}: {
  username: string;
  email: string;
}) => {
  try {
    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP({ email });
    const { databases } = await createAdminClient();

    if (existingUser) {
      throw new Error("Account already exists");
    }

    if (!accountId) throw new Error("Failed to create account");

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        username,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      }
    );

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Failed to create account");
  }
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    if (!session.secret) {
      throw new Error("Unable to retrieve session secret");
    }

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify secret");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();
    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", [result.$id])]
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "No session found") {
      return null;
    }

    handleError(error, "Failed to get current user");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      throw new Error("Account does not exist");
    }

    await sendEmailOTP({ email });
    return parseStringify({ accountId: existingUser.accountId });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const signInTestUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const index = TEST_EMAILS.findIndex(
      (testEmail) => testEmail.trim() === email.trim()
    );

    if (index === -1 || TEST_PASSWORDS[index] !== password) {
      throw new Error("Invalid test account credentials");
    }

    const session = await account.createEmailPasswordSession(email, password);
    if (!session.secret) {
      throw new Error("Unable to retrieve session secret");
    }

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to sign in test user");
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  }
};
