import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración optimizada para producción
  typescript: {
    ignoreBuildErrors: false, // En producción, no ignorar errores de TypeScript
  },
  
  // Habilitar modo estricto de React en producción
  reactStrictMode: true,
  
  // Output standalone para Docker
  output: 'standalone',
  
  // Optimización de imágenes
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compresión
  compress: true,
  
  // Configuración de webpack para producción
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }
    
    // Optimización de bundles
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },
  
  // Configuración de ESLint para producción
  eslint: {
    ignoreDuringBuilds: false, // No ignorar errores en producción
  },
  
  // Configuración de headers para seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Configuración de redirects si es necesario
  async redirects() {
    return [];
  },
  
  // Configuración experimental
  experimental: {
    // Habilitar optimizaciones experimentales
    optimizeCss: true,
    // Optimizar fuentes
    optimizeFonts: true,
    // Habilitar server actions si se usan
    serverActions: true,
  },
  
  // Configuración de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
