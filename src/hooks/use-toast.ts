
import { toast } from "sonner";
import * as React from "react";

// Create our own useToast hook that works with sonner
export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  id?: string;
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const add = React.useCallback((props: ToastProps) => {
    const id = props.id || String(Date.now());
    
    // Add toast to sonner
    if (props.variant === "destructive") {
      toast.error(props.title, {
        id,
        description: props.description,
        action: props.action,
      });
    } else {
      toast(props.title, {
        id,
        description: props.description,
        action: props.action,
      });
    }
    
    // Add toast to our internal state for the Toaster component
    setToasts((toasts) => [...toasts, { ...props, id }]);
    
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    toast.dismiss(id);
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    add,
    dismiss,
    toast: { add, dismiss },
  };
};

export { toast };
