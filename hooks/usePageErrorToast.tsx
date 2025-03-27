import { useCallback, useEffect, useRef } from "react";
import { useErrorToast } from "./useErrorToast";

export function usePageErrorToast(
  hasFileError: boolean,
  hasSpaceError: boolean
) {
  const showErrorToast = useErrorToast();
  const toastsShown = useRef(false);

  const showToast = useCallback(() => {
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
  }, [hasFileError, hasSpaceError, showErrorToast]);

  useEffect(() => {
    if (!toastsShown.current) {
      const timer = setTimeout(() => {
        showToast();
        toastsShown.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showToast]);
}
