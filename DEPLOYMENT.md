# Deploying to Vercel (Serverless)

This guide walks you through deploying the XAU/USD Analyzer to Vercel with serverless functions.

## Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub account with repo pushed
- Node.js 18+

## Step 1: Push to GitHub

```bash
cd xauusd-analyzer
git add -A
git commit -m "Add serverless functions for Vercel deployment"
git push origin master
```

## Step 2: Create Vercel Project

### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `xauusd-analyzer` folder

## Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add these variables:

```
ALPHA_VANTAGE_KEY = your_api_key_here
```

Or leave as `demo` to use mock data.

## Step 4: Update Build Settings

Vercel should auto-detect, but verify:

- **Framework Preset**: Other
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install --prefix frontend`

## Step 5: Deploy

Click "Deploy" button or run:

```bash
vercel --prod
```

## Project Structure for Vercel

```
xauusd-analyzer/
├── api/                    # Serverless functions
│   ├── price.js           # /api/price
│   ├── history.js         # /api/history
│   ├── indicators.js      # /api/indicators
│   └── prediction.js      # /api/prediction
├── lib/                   # Shared utilities
│   ├── analysis.js        # Technical indicators
│   └── dataFetcher.js     # Data fetching
├── frontend/              # React app
│   ├── src/
│   ├── dist/              # Built files (deployed)
│   └── vite.config.js
├── vercel.json           # Vercel config
├── package.json          # Root config
└── .env.example          # Environment template
```

## API Endpoints

After deployment, your API will be at:
- `https://your-project.vercel.app/api/price`
- `https://your-project.vercel.app/api/history`
- `https://your-project.vercel.app/api/indicators`
- `https://your-project.vercel.app/api/prediction`

## Local Development

### Test serverless functions locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run serverless emulator
vercel dev
```

This will start:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/*

### Normal development:

Terminal 1:
```bash
cd frontend
npm run dev
```

Terminal 2:
```bash
cd backend
npm start
```

## Troubleshooting

### Functions not working
- Check function logs: Vercel Dashboard → Deployments → Logs
- Verify environment variables are set
- Check API endpoints in browser console

### CORS errors
- CORS headers are included in all API responses
- Clear browser cache if issues persist

### Build fails
- Check build logs in Vercel Dashboard
- Verify `package.json` exists in frontend/
- Ensure Node.js 18+ is specified

## Using Real Data

Replace mock data with Alpha Vantage API:

1. Get free API key from https://www.alphavantage.co/api
2. Set `ALPHA_VANTAGE_KEY` environment variable in Vercel
3. Update `lib/dataFetcher.js` to use real API calls

## Performance Tips

- Vercel serverless functions cold start: ~1-2s first request
- Subsequent requests are cached
- Use edge caching for static assets
- Monitor function execution time in Vercel Dashboard

## Next Steps

1. Add authentication
2. Implement database (Firebase, PostgreSQL)
3. Add user preferences
4. Set up monitoring/alerts
5. Implement WebSocket for real-time updates

## Support

For issues:
- Check Vercel docs: https://vercel.com/docs
- Review API logs in dashboard
- Check GitHub issues

---

Deployment successful! Your XAU/USD Analyzer is now live on Vercel! 🚀
