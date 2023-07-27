module.exports = {
  root: true,
  extends: ["@knime/eslint-config/legacy"],
  overrides: [
    {
      files: ["__tests__/**"],
      extends: [
        "@knime/eslint-config/vue3-typescript",
        "@knime/eslint-config/vitest",
      ],
    },
  ],
};
