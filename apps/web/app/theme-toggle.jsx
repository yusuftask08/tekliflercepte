"use client";

import { Button, useTheme } from "@tekliflercepte/ui";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <Button variant="secondary" onClick={() => setTheme(next)}>
      {theme === "dark" ? "Açık tema" : "Koyu tema"}
    </Button>
  );
}
