import { FlatCompat } from "@eslint/eslintrc";
import { baseConfig } from "@tekliflercepte/config/eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [...compat.extends("next/core-web-vitals"), ...baseConfig];
