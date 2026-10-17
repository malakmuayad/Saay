import type { Theme } from "~/types/Theme";

export function setLocalStorageTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
}

export function getTheme() {
  return localStorage.getItem("theme");
}
