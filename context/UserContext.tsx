"use client";

import { Models } from "node-appwrite";
import { createContext, useContext, type ReactNode } from "react";

const UserContext = createContext<{ currentUser: Models.Document } | null>(
  null
);

export function UserProvider({
  children,
  currentUser,
}: {
  children: ReactNode;
  currentUser: Models.Document;
}) {
  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
