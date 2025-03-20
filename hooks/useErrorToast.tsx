import { useCallback, useEffect, useRef } from "react";
import { useToast } from "./use-toast";

export function useErrorToast(hasFileError: boolean, hasSpaceError: boolean) {
  const { toast } = useToast();
  const toastsShown = useRef(false);

  const showToast = useCallback(() => {
    if (hasFileError) {
      toast({
        description: (
          <p className="body-2 text-white">
            Could not load your files. Please try again by refreshing the page.
          </p>
        ),
        className: "error-toast",
      });
    }

    if (hasSpaceError) {
      toast({
        description: (
          <p className="body-2 text-white">
            Could not load your storage information. Please try again by
            refreshing the page.
          </p>
        ),
        className: "error-toast",
      });
    }
  }, [hasFileError, hasSpaceError, toast]);

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
