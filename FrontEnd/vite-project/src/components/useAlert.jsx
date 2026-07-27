
import { useState } from "react";

function useAlert() {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title, message, type = "info") => {
    setAlert({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  return { alert, showAlert, closeAlert };
}

export default useAlert;