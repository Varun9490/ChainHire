import { useCallback } from "react";
import toast from "react-hot-toast";

export function useToast() {
  // Wrap react-hot-toast for a consistent API
  return {
    toast: useCallback((opts) => {
      if (typeof opts === "string") return toast(opts);
      if (opts.variant === "destructive") {
        return toast.error(opts.description || opts.title || "Error");
      }
      return toast.success(opts.description || opts.title || "Success");
    }, []),
  };
}
