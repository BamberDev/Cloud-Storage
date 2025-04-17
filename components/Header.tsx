import Search from "./Search";
import FileUploader from "./FileUploader";
import SignOutButton from "./SignOutButton";
import { memo } from "react";

const Header = memo(function Header({
  $id: ownerId,
  accountId,
  email: userEmail,
}: {
  $id: string;
  accountId: string;
  email: string;
}) {
  return (
    <header className="header">
      <Search userId={ownerId} userEmail={userEmail} />
      <div className="header-wrapper">
        <FileUploader ownerId={ownerId} accountId={accountId} />
        <SignOutButton />
      </div>
    </header>
  );
});

export default Header;
