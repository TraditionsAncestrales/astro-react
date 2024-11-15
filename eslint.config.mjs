import astro from "eslint-plugin-astro";
import unicorn from "eslint-plugin-unicorn";

export default [
  unicorn.configs["flat/recommended"],
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-strict"],
  {
    rules: {
      "unicorn/prefer-module": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
];
