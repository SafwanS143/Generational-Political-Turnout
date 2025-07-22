import type { NextConfig } from "next";

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true, // Needed for GitHub Pages
  basePath: '/Generational-Political-Turnout', // Use your repo name here
};

module.exports = nextConfig;