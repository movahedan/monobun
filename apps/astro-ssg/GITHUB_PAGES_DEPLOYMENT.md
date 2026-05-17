# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy the astro-ssg app to GitHub Pages using the official Astro GitHub Action.

## 📋 Prerequisites

- A GitHub account
- Your project pushed to a GitHub repository
- GitHub Pages enabled on your repository

## 🎯 Quick Setup

### 1. Update Configuration

First, update the `astro.config.mjs` file with your actual GitHub username:

```javascript
export default defineConfig({
  output: 'static',
  site: 'https://your-username.github.io', // Replace with your actual GitHub username
  base: 'astro-ssg', // Repository or site path segment (adjust if your Pages URL differs)
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** > **Pages**
3. Set **Source** to **GitHub Actions**
4. Save the changes

### 3. Push and Deploy

The GitHub Action will automatically deploy your site when you push to the `main` branch:

```bash
git add .
git commit -m "Add astro-ssg GitHub Pages deployment"
git push origin main
```

## 🔧 Configuration Details

### Astro Configuration

The app is configured for GitHub Pages with:

- **Static Output**: `output: 'static'` for static site generation
- **Site URL**: Set to your GitHub Pages URL
- **Base Path**: Set to repository name for proper routing
- **No Jekyll**: `.nojekyll` file prevents Jekyll processing

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) includes:

- **Automatic Triggers**: Deploys on push to `main` branch
- **Manual Triggers**: Can be run manually from Actions tab
- **Proper Permissions**: Configured for GitHub Pages deployment
- **Bun Package Manager**: Uses bun for faster builds
- **Path Configuration**: Points to `apps/astro-ssg` in monorepo

## 🌐 Custom Domain Setup

### Option 1: GitHub Pages Custom Domain

1. Add a `CNAME` file to `apps/astro-ssg/public/`:
   ```
   docs.yourdomain.com
   ```

2. Update `astro.config.mjs`:
   ```javascript
   export default defineConfig({
     output: 'static',
     site: 'https://docs.yourdomain.com', // Your custom domain
     // Remove base: 'astro-ssg' for custom domain
     vite: {
       plugins: [tailwindcss()],
     },
   });
   ```

3. Configure DNS with your domain provider

### Option 2: Subdomain Setup

For a subdomain like `docs.yourdomain.com`:

1. Add CNAME record: `docs.yourdomain.com` → `your-username.github.io`
2. Update the `CNAME` file and `astro.config.mjs` as above

## 📊 Monitoring Deployment

### Check Deployment Status

1. Go to your GitHub repository
2. Click **Actions** tab
3. Monitor the "Deploy astro-ssg to GitHub Pages" workflow
4. Check the deployment URL in the workflow output

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check the Actions tab for error logs
   - Verify all dependencies are in `package.json`
   - Ensure Node.js version compatibility

2. **404 Errors**
   - Verify `base` path is correct in `astro.config.mjs`
   - Check that `.nojekyll` file is present
   - Ensure all internal links use the correct base path

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check that `@tailwindcss/typography` is installed
   - Ensure CSS is being built correctly

#### Debug Commands

```bash
# Test build locally
cd apps/astro-ssg
bun run build

# Check build output
ls -la dist/

# Test locally
bun run preview
```

## 🔄 Continuous Deployment

Once configured, the workflow will:

- **Automatic Deployments**: Deploy on every push to `main`
- **Manual Deployments**: Run manually from Actions tab
- **Rollbacks**: Previous deployments are available in GitHub Pages settings

### Branch Deployment

To deploy from different branches:

1. Update the workflow trigger in `.github/workflows/deploy.yml`:
   ```yaml
   on:
     push:
       branches: [ main, develop ] # Add your branch
   ```

2. Or create separate workflows for different environments

## 📈 Performance Optimization

### Built-in Optimizations

- **Static Generation**: Pre-rendered HTML for fast loading
- **Asset Optimization**: Images and CSS automatically optimized
- **Code Splitting**: JavaScript split into smaller chunks
- **Caching**: Aggressive caching for static assets

### GitHub Pages Features

- **Global CDN**: Fast loading worldwide
- **HTTPS**: Automatic SSL certificates
- **Custom Domains**: Support for custom domains
- **Branch Deployments**: Deploy from different branches

## 🔒 Security

### HTTPS

- GitHub Pages automatically provides HTTPS
- No additional configuration needed

### Security Headers

The nginx configuration includes security headers that will be applied when serving locally:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## 🎯 Next Steps

After successful deployment:

1. **Test Your Site**
   - Visit your GitHub Pages URL
   - Test all documentation links
   - Verify responsive design

2. **Set Up Monitoring**
   - Enable GitHub Pages analytics
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

- [Astro GitHub Pages Documentation](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [withastro/action](https://github.com/withastro/action)

## 🎉 Conclusion

The astro-ssg app is now configured for automatic deployment to GitHub Pages. Every push to the main branch will trigger a new deployment, ensuring your documentation is always up-to-date.

The setup provides:
- ✅ **Automatic Deployments**: Deploy on every push
- ✅ **Fast Performance**: Static generation with global CDN
- ✅ **Custom Domains**: Support for custom domains
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **Easy Maintenance**: Just push to deploy

Your documentation site will be available at `https://your-username.github.io/astro-ssg/` once deployed (adjust the path if your repository name differs). 