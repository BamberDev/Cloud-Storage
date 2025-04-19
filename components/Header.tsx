import Search from "./Search";
import FileUploader from "./FileUploader";
import SignOutButton from "./SignOutButton";
import { memo } from "react";

const Header = memo(function Header() {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader />
        <SignOutButton />
      </div>
    </header>
  );
});

export default Header;
