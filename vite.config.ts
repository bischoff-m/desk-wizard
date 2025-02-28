import { dirname, resolve } from "path";
import { defineConfig, Plugin } from "vitest/config";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/guide/build.html#library-mode
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "desk-wizard",
            fileName: "desk-wizard"
        },
        sourcemap: true,
        minify: true,
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
    test: {},
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ] as Plugin[],
});
