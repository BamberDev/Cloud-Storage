import Search from "./Search";
import FileUploader from "./FileUploader";
import SignOutButton from "./SignOutButton";
import { memo } from "react";

const Header = memo(function Header({
  $id: ownerId,
  accountId,
}: {
  $id: string;
  accountId: string;
}) {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={ownerId} accountId={accountId} />
        <SignOutButton />
      </div>
    </header>
  );
});

export default Header;
