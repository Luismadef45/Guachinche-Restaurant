module.exports = {
  root: true,
  ignorePatterns: [
    ".next",
    "node_modules",
    "dist",
    "out",
    "coverage"
  ],
  overrides: [
    {
      files: [
        "*.ts",
        "*.tsx"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      plugins: [
        "@typescript-eslint"
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
      ]
    },
    {
      files: [
        "apps/web/**/*.{ts,tsx}"
      ],
      // Next.js linting is handled by apps/web/.eslintrc.json or next lint command
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
      ]
    },
    {
      files: [
        "apps/api/**/*.ts",
        "packages/**/*.ts"
      ],
      env: {
        node: true
      }
    }
  ]
};
