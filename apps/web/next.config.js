/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-wp/agents', '@ai-wp/block-engine', '@ai-wp/deployer'],
};

module.exports = nextConfig;
