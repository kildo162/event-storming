# Event Storming

[![Deploy to GitHub Pages](https://github.com/kildo162/event-storming/actions/workflows/deploy.yml/badge.svg)](https://github.com/kildo162/event-storming/actions/workflows/deploy.yml)

A collaborative tool for Event Storming sessions.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is automatically deployed to GitHub Pages at https://event-storming.khanhnd.com when changes are pushed to the main branch.

### Manual Deployment

If you need to deploy manually:

1. Build the project:
```bash
npm run build
```

2. The build output will be in the `dist` directory and automatically deployed via GitHub Actions.

## Deployment Configuration

- The site is deployed to GitHub Pages
- Custom domain: `event-storming.khanhnd.com`
- Automatic deployments via GitHub Actions on push to main branch
- SSL/TLS provided by Cloudflare

## License

MIT