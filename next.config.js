// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
const withTM = require('next-transpile-modules')([
  'react-markdown',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-sollet',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
  withTM({
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
      if (!isServer) config.resolve.fallback.fs = false;
      return config;
    },
    env: {
      REALM: process.env.REALM,
      MAINNET_RPC: "https://rpc.helius.xyz/?api-key=4b483911-5163-4078-aeeb-02bcba97f85a",
      DEVNET_RPC: process.env.DEVNET_RPC,
      DEFAULT_GOVERNANCE_PROGRAM_ID: process.env.DEFAULT_GOVERNANCE_PROGRAM_ID,
    },
    async redirects() {
      return [
        {
          source: '/dao/UXD/:path*',
          destination: '/dao/UXP/:path*',
          permanent: true,
        },
      ];
    },
  }),
);
