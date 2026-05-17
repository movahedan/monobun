# 🚀 Cloudflare Pages Deployment Guide

This guide will help you deploy the astro-ssg app to Cloudflare Pages.

## 📋 Prerequisites

- A Cloudflare account
- Your project pushed to a Git repository (GitHub, GitLab, etc.)
- Node.js 18+ support (Cloudflare Pages supports this automatically)

## 🎯 Quick Deployment

### Option 1: Cloudflare Dashboard (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** > **Create**

2. **Create Pages Project**
   - Select the **Pages** tab
   - Click **Connect to Git**
   - Select your repository containing the astro-ssg app

3. **Configure Build Settings**
   - **Framework preset**: `Astro`
   - **Production branch**: `main` (or your default branch)
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `apps/astro-ssg` (if in monorepo)

4. **Environment Variables** (if needed)
   - Add any environment variables your app requires
   - For most documentation sites, none are needed

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete
   - Your site will be available at `your-project-name.pages.dev`

### Option 2: Cloudflare CLI (C3)

```bash
# Install Cloudflare CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from the astro-ssg directory
cd apps/astro-ssg
wrangler pages deploy dist --project-name=your-project-name
```

## 🔧 Build Configuration

The app is configured for optimal Cloudflare Pages deployment:

### Astro Configuration (`astro.config.mjs`)
```javascript
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  // ... other config
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

## 🌐 Custom Domain Setup

1. **Add Custom Domain**
   - Go to your Pages project in Cloudflare Dashboard
   - Navigate to **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `docs.yourdomain.com`)

2. **DNS Configuration**
   - Cloudflare will automatically configure DNS
   - If using external DNS, add a CNAME record pointing to your Pages domain

## 🔄 Continuous Deployment

Once connected to Git, Cloudflare Pages will:

- **Automatic Deployments**: Deploy on every push to your main branch
- **Preview Deployments**: Create preview URLs for pull requests
- **Rollbacks**: Allow you to rollback to previous deployments

### Branch Deployment Controls

You can configure which branches trigger deployments:

1. Go to your Pages project settings
2. Navigate to **Builds and deployments**
3. Configure branch deployment rules

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Cloudflare Dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **404 Errors**
   - Ensure `output: 'server'` is set in Astro config
   - Check that the Cloudflare adapter is properly configured

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check that `@tailwindcss/typography` is installed

### Debug Commands

```bash
# Test build locally
bun run build

# Preview build
bun run preview

# Check for issues
bun run astro check
```

## 📊 Analytics and Monitoring

### Web Analytics
1. Go to your Pages project
2. Navigate to **Analytics**
3. Enable **Web Analytics** for traffic insights

### Performance Monitoring
- Cloudflare Pages provides built-in performance metrics
- Monitor Core Web Vitals in the Analytics section
- Use Cloudflare's Speed Test tool for performance insights

## 🔒 Security

### HTTPS
- Cloudflare Pages automatically provides HTTPS
- No additional configuration needed

### Security Headers
Add security headers in your Astro configuration:

```javascript
export default defineConfig({
  // ... other config
  vite: {
    plugins: [tailwindcss()],
    server: {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  }
});
```

## 📈 Performance Optimization

### Build Optimization
- The app uses Astro's built-in optimizations
- Static assets are automatically optimized
- CSS is minified and optimized

### Caching
- Cloudflare Pages provides automatic caching
- Static assets are cached at the edge
- Dynamic content uses appropriate cache headers

## 🎯 Next Steps

After successful deployment:

1. **Test Your Site**
   - Visit your Pages domain
   - Test all documentation links
   - Verify responsive design

2. **Set Up Monitoring**
   - Enable Web Analytics
   - Set up uptime monitoring if needed

3. **Customize**
   - Update the site title and description
   - Customize the color scheme
   - Add your logo

4. **Share**
   - Share your documentation URL with your team
   - Add it to your project's README
   - Link it from your main project

## 📚 Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Pages Framework Guides](https://developers.cloudflare.com/pages/framework-guides/) 