// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: [
    "@knime/eslint-config/vue3-typescript",
    "@knime/eslint-config/vitest",
  ],
  env: {
    node: true,
    browser: true,
  },
  globals: {
    consola: true,
  },
  ignorePatterns: ["mocks/"],
  settings: {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        alias: {
          "@": "./src",
          "@@": ".",
        },
      },
    },
  },
  rules: {
    "no-global-assign": [
      "error",
      {
        // `require` is needed for the esm module
        exceptions: ["require"],
      },
    ],
  },
};
