import { createMDX } from 'fumadocs-mdx/next';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const withMDX = createMDX({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    lastModifiedTime: 'git',
  },
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_SKIP_TYPE_CHECK === "1" ? true : undefined,
  },
};

export default withMDX(config);
