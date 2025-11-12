"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 text-gray-500 rounded-full"
    >
      {theme === "dark" ? <Moon /> : <Sun />}
    </Button>
  );
}
