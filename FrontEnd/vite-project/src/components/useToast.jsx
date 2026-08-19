import { useEffect, useState } from "react";

function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    console.log("TOAST:", toast);

    if (toast === null) {
      return;
    }

    const timer = setTimeout(() => {
      console.log("TOAST TIMER FINISHED");
      setToast(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  return {
    toast,
    showToast,
    hideToast
  };
}

export default useToast;