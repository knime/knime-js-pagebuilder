import { URL, fileURLToPath } from "node:url";

import type { BuildOptions, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import svgLoader from "vite-svg-loader";

// @ts-ignore
import { svgoConfig } from "@knime/styles/config/svgo.config";

// https://vitejs.dev/config/
// https://vitest.dev/config/
export default defineConfig(({ mode }) => {
  const wrapperBuild: BuildOptions = {
    outDir: "./dist/app",
    rollupOptions: {
      input: {
        apWrapper: fileURLToPath(new URL("apWrapper.html", import.meta.url)),
      },
    },
    // All the web resources for the legacy javascript-based views are made available to the frontend at a
    // 'single entry point', referenced through paths relative to the page-builder main html-document (see above).
    // As a result, all the resources need to be properly 'namespaced' by residing at unique relative paths.
    // To achieve that, the resources are usually organised by the names/ids of the projects contributing it.
    // And since the page-builder assets are made available in the same way, we 'namespace' them by using
    // the page-builder project-name for consinstency and to avoid 'collisions' with other resources.
    assetsDir: "org/knime/core/ui/pagebuilder/app/assets",
  };

  const libBuild: BuildOptions = {
    outDir: "./dist/lib",
    lib: {
      entry: fileURLToPath(new URL("src/lib.js", import.meta.url)),
      name: "PageBuilder",
      fileName: () => "PageBuilder.umd.js", // need to enforce the .js file ending, as the default would now be .cjs
      formats: ["umd"],
    },
    rollupOptions: {
      external: ["vue", "consola"],
      output: {
        globals: {
          vue: "Vue",
          consola: "consola",
        },
      },
    },
  };

  const config: UserConfig = {
    base: "./",
    plugins: [vue(), svgLoader({ svgoConfig })],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@@": fileURLToPath(new URL(".", import.meta.url)),
      },
      dedupe: [
        "vue", // needed for DateTimeWidget v-calendar to work
      ],
    },
    test: {
      include: ["src/**/__tests__/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**"],
      environment: "jsdom",
      reporters: ["default", "junit"],
      deps: { inline: ["consola"] },
      setupFiles: [fileURLToPath(new URL("vitest.setup.js", import.meta.url))],
      coverage: {
        all: true,
        exclude: [
          "coverage/**",
          "dist/**",
          "lib/**",
          "test/assets/**",
          "**/*.d.ts",
          "src/**/__tests__/**",
          "src/**/types/**",
          "src/dev/**",
          "**/{vite,vitest,postcss,lint-staged}.config.{js,cjs,mjs,ts}",
          "**/.{eslint,prettier,stylelint}rc.{js,cjs,yml}",
        ],
        reporter: ["html", "text", "lcov"],
      },
      outputFile: {
        junit: "test-results/junit.xml", // needed for Bitbucket Pipeline, see https://support.atlassian.com/bitbucket-cloud/docs/test-reporting-in-pipelines/
      },
    },
    envPrefix: "KNIME_",
  };

  if (mode === "lib") {
    config.plugins?.push(cssInjectedByJsPlugin()); // not supported natively in Vite yet, see https://github.com/vitejs/vite/issues/1579
    config.build = libBuild;
  } else {
    config.build = wrapperBuild;
  }
  return config;
});
