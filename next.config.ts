import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports= {
    env: {
        apiKey: process.env.API_KEY,
    },
}
export default nextConfig;
