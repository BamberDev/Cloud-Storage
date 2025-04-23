import { useEffect, useRef } from "react";
import { useErrorToast } from "./useErrorToast";

export function usePageErrorToast(
  hasFileError: boolean,
  hasSpaceError: boolean
) {
  const showErrorToast = useErrorToast();
  const toastsShown = useRef(false);

  useEffect(() => {
    if (toastsShown.current) return;

    const timer = setTimeout(() => {
      if (hasFileError) {
        showErrorToast(
          "Could not load your files. Please try again by refreshing the page."
        );
      }

      if (hasSpaceError) {
        showErrorToast(
          "Could not load your storage usage. Please try again by refreshing the page."
        );
      }

      toastsShown.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [hasFileError, hasSpaceError, showErrorToast]);
}
