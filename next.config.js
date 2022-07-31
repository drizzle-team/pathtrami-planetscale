/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['pathtrami.s3.amazonaws.com'],
	},
	experimental: {
		optimizeCss: true,
	},
};

module.exports = nextConfig;
