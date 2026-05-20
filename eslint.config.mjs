import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "node_modules/**", "prisma/migrations/**", "next-env.d.ts"] },
  ...coreWebVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
