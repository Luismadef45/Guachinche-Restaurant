module.exports = {
  "*.{ts,tsx,js,jsx,css,md,json,yml,yaml}": [
    "prettier --write"
  ],
  "*.{ts,tsx}": [
    "eslint --max-warnings 0"
  ]
};
