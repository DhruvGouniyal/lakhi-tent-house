import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the user's home directory, which
  // Next would otherwise infer as the workspace root. Pin it to this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
