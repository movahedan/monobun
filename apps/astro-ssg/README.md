# 📚 Docs Astro

A modern documentation site built with Astro for the project documentation.

## 🚀 Features

- **Modern Design**: Clean, responsive design with Tailwind CSS
- **Markdown Support**: All documentation files are rendered from markdown
- **Cloudflare Pages**: Optimized for deployment on Cloudflare Pages
- **Navigation**: Sidebar navigation with all documentation sections
- **Typography**: Beautiful typography with @tailwindcss/typography

## 📁 Structure

```
src/
├── content/docs/     # All documentation markdown files
├── layouts/          # Layout components
├── pages/           # Astro pages and routes
└── styles/          # Global styles
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## 🚀 Deployment

This app is configured for deployment on Cloudflare Pages:

1. **Framework preset**: `Astro`
2. **Build command**: `bun run build`
3. **Build output directory**: `dist`
4. **Node.js version**: 18 or higher

### Manual Deployment

1. Build the project: `bun run build`
2. Upload the `dist` folder to Cloudflare Pages
3. Configure custom domain if needed

### Git Integration

Connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Create new Pages project
3. Connect your GitHub repository
4. Configure build settings as above
5. Deploy!

## 📝 Adding Documentation

To add new documentation:

1. Add your markdown file to `src/content/docs/`
2. Update the navigation in `src/layouts/Layout.astro`
3. Update the static paths in `src/pages/docs/[...slug].astro`

## 🎨 Customization

- **Styling**: Modify `src/styles/global.css` for custom styles
- **Layout**: Update `src/layouts/Layout.astro` for layout changes
- **Navigation**: Edit the sidebar navigation in the layout file
- **Theme**: Customize Tailwind configuration in `tailwind.config.mjs`

## 🔧 Configuration

The app uses:
- **Astro** for the framework
- **Tailwind CSS** for styling
- **@astrojs/cloudflare** for Cloudflare Pages deployment
- **@tailwindcss/typography** for markdown styling
- **marked** for markdown parsing
