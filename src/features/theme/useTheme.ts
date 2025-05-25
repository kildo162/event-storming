import { useCallback, useEffect, useState } from "react";

export function useTheme() {
  const getSystemTheme = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [dark, setDark] = useState(getSystemTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = useCallback(() => {
    setDark((prev) => !prev);
  }, []);

  return { dark, setDark, toggleTheme };
}
