import uiPreset from "@tekliflercepte/ui/tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [uiPreset],
  content: [
    "./app/**/*.{js,jsx}",
    "../../packages/ui/src/**/*.{js,jsx}",
  ],
};
