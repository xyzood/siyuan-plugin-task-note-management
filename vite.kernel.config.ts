import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

const env = process.env;
const isDev = env.NODE_ENV === "development";
const outputDir = isDev ? "dev" : "dist";

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },

    define: {
        "process.env.DEV_MODE": JSON.stringify(isDev),
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
    },

    build: {
        outDir: outputDir,
        // 不清理输出目录，避免覆盖前端构建产物
        emptyOutDir: false,
        minify: !isDev,
        sourcemap: false,

        lib: {
            entry: resolve(__dirname, "src/kernel.ts"),
            fileName: "kernel",
            formats: ["es"],
        },
        rollupOptions: {
            external: ["siyuan", "process"],
            output: {
                entryFileNames: "kernel.js",
                // 禁用代码分割，内核插件打包为单文件
                manualChunks: undefined,
                inlineDynamicImports: true,
            },
        },
    },
});
