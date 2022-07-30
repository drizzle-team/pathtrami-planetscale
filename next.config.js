/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['pathtrami.s3.amazonaws.com'],
	},
};

module.exports = nextConfig;
