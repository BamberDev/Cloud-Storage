import { useToast } from "./use-toast";

export function useErrorToast() {
  const { toast } = useToast();

  const showErrorToast = (message: string) => {
    toast({
      description: <p>{message}</p>,
      variant: "destructive",
    });
  };

  return showErrorToast;
}
