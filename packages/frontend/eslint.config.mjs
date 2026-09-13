import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React Compiler-preview rules that flag common, working patterns
      // (e.g. reading localStorage in an effect). Kept as off to avoid a
      // large refactor of established code; revisit with React Compiler.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      // The codebase deliberately uses `any` for catch/error typing at MVP
      // speed. Downgraded to warning so it stays visible without failing CI.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;