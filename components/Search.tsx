"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { useDebounce } from "use-debounce";
import { XIcon } from "lucide-react";

export default function Search({
  className,
  userId,
  userEmail,
}: {
  className?: string;
  userId: string;
  userEmail: string;
}) {
  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(searchQuery);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        setError(null);
        setIsLoading(false);

        if (searchParams.toString()) {
          router.push(path);
        }
        return;
      }

      try {
        setIsLoading(true);
        setOpen(true);
        setError(null);
        const files = await getFiles({
          types: [],
          searchText: debouncedQuery,
          userId,
          userEmail,
        });
        setResults(files.documents);
      } catch {
        setError("Something went wrong while fetching files. Please try again");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);

    const route =
      file.type === "video" || file.type === "audio"
        ? "media"
        : file.type + "s";
    router.push(`/${route}?query=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className={`search ${className}`}>
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search icon"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          tabIndex={-1}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search files"
        />
        {query && (
          <button onClick={clearSearch} aria-label="Clear search">
            <XIcon size={24} />
          </button>
        )}
        {open && (
          <ul className="search-result">
            {isLoading ? (
              <p className="empty-result" role="status" aria-live="polite">
                Searching...
              </p>
            ) : error ? (
              <p className="error-message" role="alert">
                {error}
              </p>
            ) : results.length > 0 ? (
              results.map((file) => (
                <li
                  className="flex items-center justify-between cursor-pointer"
                  key={file.$id}
                  onClick={() => handleClickItem(file)}
                  aria-label={`View details for ${file.name}`}
                >
                  <div className="flex items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                      alt={`Thumbnail for ${file.name}`}
                    />
                    <p className="subtitle-2 line-clamp-1">{file.name}</p>
                  </div>

                  <FormattedDateTime
                    date={file.$createdAt}
                    className="line-clamp-1"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result" role="status" aria-live="polite">
                No matching files found
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
