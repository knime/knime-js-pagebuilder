import { URL, fileURLToPath } from "node:url";

import type { BuildOptions, PluginOption, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import svgLoader from "vite-svg-loader";

// @ts-ignore
import { svgoConfig } from "@knime/styles/config/svgo.config";

/*
 * The build modes are used to determine the build configuration.
 * - "lib": build the library with the PageBuilderComponent exposed.
 * - "shadow-app-lib": build the library with the PageBuilderComponent embedded in the library to use as a shadow app. Expose an init function to mount the shadow app.
 * - "standalone": build the standalone app.
 */
const libBuildMode = "lib";
const shadowAppLibBuildMode = "shadow-app-lib";
const standaloneBuildMode = "app";

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

  const shadowLibBuild: BuildOptions = {
    outDir: "./dist/shadowAppLib",
    lib: {
      entry: fileURLToPath(new URL("src/shadowAppLib.js", import.meta.url)),
      name: "PageBuilder",
      fileName: () => "PageBuilderShadowApp.esm.js",
      formats: ["es"],
    },
  };

  const config: UserConfig = {
    base: "./",
    plugins: [
      vue(),
      svgLoader({ svgoConfig }),
      ...(mode === shadowAppLibBuildMode
        ? [
            {
              apply: "build",
              enforce: "post",
              name: "macro-replace-css",
              generateBundle(_: any, bundle: any) {
                const bundleKeys = Object.keys(bundle);
                const bundleFilenames = bundleKeys.filter((name) =>
                  name.endsWith(".js"),
                );
                const cssFilename = bundleKeys.find((name) =>
                  name.endsWith(".css"),
                );

                if (!bundleFilenames || !cssFilename) {
                  // eslint-disable-next-line no-console
                  console.log("Do not call macro-replace-css");
                  return;
                }

                bundleFilenames.forEach((file) => {
                  const {
                    // @ts-ignore
                    [cssFilename]: { source: rawCss },
                    [file]: component,
                  } = bundle;

                  // @ts-ignore
                  component.code = component.code.replace(
                    "__INLINE_CSS_CODE__",
                    JSON.stringify(rawCss),
                  );
                });
                // remove css file from final bundle
                delete bundle[cssFilename];
              },
            } as unknown as PluginOption,
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@date-fns-tz": fileURLToPath(
          new URL("./node_modules/date-fns-tz", import.meta.url),
        ),
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

  if (mode === libBuildMode) {
    config.plugins?.push(cssInjectedByJsPlugin()); // not supported natively in Vite yet, see https://github.com/vitejs/vite/issues/1579
    config.build = libBuild;
  } else if (mode === shadowAppLibBuildMode) {
    config.build = shadowLibBuild;
  } else {
    if (mode !== standaloneBuildMode && mode !== "test") {
      // eslint-disable-next-line no-console
      console.error(`Unknown build mode: ${mode}. Using default build mode.`);
    }
    config.build = wrapperBuild;
  }
  return config;
});
