/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com'],
    },
    experimental: {
        fetchCache: 'force-no-store'
    }
};

export default nextConfig;
