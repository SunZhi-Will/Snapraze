/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com'],
    },
    experimental: {
        fetchCache: false
    }
};

export default nextConfig;
