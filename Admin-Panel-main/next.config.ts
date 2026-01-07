import { getBaseURL } from '@/services/env';
import type { NextConfig } from 'next';
import { TurbopackLoaderItem } from 'next/dist/server/config-shared';

const svgrLoader: TurbopackLoaderItem = {
  loader: '@svgr/webpack',
  options: {
    icon: '100%',
    svgo: true,
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              convertColors: {
                currentColor: true,
              },
              removeViewBox: false,
            },
          },
        },
        { name: 'prefixIds', params: {} },
      ],
    },
  },
};

const coloredSvgrLoader: TurbopackLoaderItem = {
  loader: '@svgr/webpack',
  options: {
    icon: '100%',
    svgo: true,
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
        { name: 'prefixIds', params: {} },
      ],
    },
  },
};

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.colored.svg': {
        as: '*.js',
        loaders: [coloredSvgrLoader],
      },
      '*.svg': {
        as: '*.js',
        loaders: [svgrLoader],
      },
    },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.colored\.svg$/i,
      use: [coloredSvgrLoader],
    });
    config.module.rules.push({
      test: /\.svg$/i,
      exclude: /\.colored\.svg$/i,
      use: [svgrLoader],
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/assets/:path*',
        destination: `${getBaseURL()}/api/v1/asset/:path*`,
      },
      { source: '/api/auth/:path*', destination: `${getBaseURL()}/api/auth/:path*` },
    ];
  },
};

export default nextConfig;
