# Render Deployment Guide

This document explains how to deploy the Device Catalog Web App to Render and resolve common memory issues.

## 🚀 Quick Deploy

1. **Connect Repository**: Link your GitHub repository to Render
2. **Service Type**: Choose "Static Site" 
3. **Build Command**: `npm run build:memory-optimized`
4. **Publish Directory**: `dist`

## 🔧 Memory Optimization

### Problem
The app was failing with "JavaScript heap out of memory" errors during build on Render's free tier (512MB memory limit).

### Solution
We implemented several optimizations:

#### 1. **Memory-Optimized Build Script**
```json
{
  "scripts": {
    "build:memory-optimized": "NODE_OPTIONS='--max-old-space-size=2048' tsc -b --noCheck && NODE_OPTIONS='--max-old-space-size=2048' vite build"
  }
}
```

#### 2. **Vite Build Optimizations**
- **Terser minification** with console.log removal
- **Aggressive code splitting** into vendor chunks
- **Manual chunk configuration** for better memory management

#### 3. **Code Optimizations**
- **Lazy loading** of heavy components
- **Suspense boundaries** for better loading states
- **Bundle size reduction** from 1,732KB to 1,040KB (~40% improvement)

## 📁 Using render.yaml

The `render.yaml` file provides automated deployment configuration:

```yaml
services:
  - type: web
    name: device-catalog-webapp
    runtime: static
    buildCommand: npm run build:memory-optimized
    staticPublishPath: ./dist
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_OPTIONS
        value: --max-old-space-size=2048
```

## 🛠️ Manual Render Configuration

If not using render.yaml, configure manually in Render Dashboard:

### Environment Variables
- `NODE_ENV`: `production`
- `NODE_OPTIONS`: `--max-old-space-size=2048`

### Build Settings
- **Build Command**: `npm run build:memory-optimized`
- **Publish Directory**: `dist`

## 🔍 Troubleshooting

### Memory Issues
- Monitor build logs for "heap out of memory" errors
- Consider upgrading to paid tier for more memory
- Use the memory-optimized build script

### Build Failures
- Check that all dependencies are in package.json
- Verify Node.js version compatibility (20.x or 22.x)
- Ensure terser is installed as devDependency

### Performance
- Monitor bundle sizes in build output
- Use lazy loading for large components
- Consider further code splitting if needed

## 📊 Bundle Analysis

After optimization:
- **Main bundle**: 1,040KB (was 1,732KB)
- **React chunk**: 11KB
- **UI components**: 83KB  
- **Icons**: 118KB
- **Charts**: 398KB
- **Utils**: 54KB

## 🔗 Resources

- [Render Static Sites Documentation](https://render.com/docs/static-sites)
- [Render Troubleshooting](https://render.com/docs/troubleshooting-deploys)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
