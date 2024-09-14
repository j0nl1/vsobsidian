import { defineConfig } from "tsup";

/**
 * @see https://tsup.egoist.dev/#usage
 */
export default defineConfig({
  dts: false,
  bundle: true,
  format: "cjs",
  outDir: "build",
  target: "esnext",
  sourcemap: true,
  platform: "node",
  external: ["vscode"],
  entry: ["src/extension.ts"],
});
