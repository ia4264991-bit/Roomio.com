import { useEffect, useState } from "react";

export type ColorMode = "night" | "light" | "sunset" | "ocean";

const STORAGE_KEY = "roomioColorMode";

export const colorModes: { value: ColorMode; label: string; icon: string }[] = [
  { value: "night", label: "Night", icon: "🌙" },
  { value: "light", label: "Light", icon: "☀️" },
  { value: "sunset", label: "Sunset", icon: "🌇" },
  { value: "ocean", label: "Ocean", icon: "🌊" },
];

export const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode>("night");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    if (stored && colorModes.some((item) => item.value === stored)) {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return { mode, setMode };
};
