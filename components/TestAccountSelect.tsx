"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEST_EMAILS, TEST_PASSWORDS } from "@/lib/utils";

const TEST_ACCOUNTS = TEST_EMAILS.map((email, index) => ({
  email: email.trim(),
  password: TEST_PASSWORDS[index]?.trim() || "",
}));

export function TestAccountSelect({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  return (
    <Select
      onValueChange={(selectedEmail) => {
        const account = TEST_ACCOUNTS.find(
          (acc) => acc.email === selectedEmail
        );
        if (account) {
          onSelect(account.email, account.password);
        }
      }}
    >
      <SelectTrigger className="test-account-select">
        <SelectValue placeholder="Select test account" />
      </SelectTrigger>
      <SelectContent>
        {TEST_ACCOUNTS.map((account, index) => (
          <SelectItem key={account.email} value={account.email}>
            {`Test Account ${index + 1}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
