const {
  VERCEL_ENV,
  VERCEL_URL,
  VERCEL_BRANCH_URL,
  VERCEL_PROJECT_PRODUCTION_URL,
} = process.env;

const DEPLOYMENT_URL = (() => {
  switch (VERCEL_ENV) {
    case "production":
      return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
    case "preview":
      return `https://${VERCEL_BRANCH_URL || VERCEL_URL}`;
    default:
      return `http://localhost:${process.env.PORT || 3000}`;
  }
})();

const PLUGIN_URL =
  DEPLOYMENT_URL || `${"localhost"}:${process.env.PORT || 3000}`;

const ACCOUNT_ID = process.env.ACCOUNT_ID;

const SEPOLIA_CHAIN_ID = 11155111;

export { ACCOUNT_ID, PLUGIN_URL, SEPOLIA_CHAIN_ID };
