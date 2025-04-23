import Search from "./Search";
import FileUploader from "./FileUploader";
import SignOutButton from "./SignOutButton";

export default function Header() {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader />
        <SignOutButton />
      </div>
    </header>
  );
}
