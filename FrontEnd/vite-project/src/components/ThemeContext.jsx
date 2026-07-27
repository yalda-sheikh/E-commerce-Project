import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // اول localStorage رو چک می‌کنیم
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // اگه چیزی ذخیره نشده بود، تم سیستم رو چک کن
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  });

  useEffect(() => {
    // اعمال تم روی تگ html
    document.documentElement.setAttribute("data-theme", theme);
    // ذخیره در localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// هوک کاستوم برای دسترسی راحت‌تر
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme باید داخل ThemeProvider استفاده بشه");
  }
  return context;
}