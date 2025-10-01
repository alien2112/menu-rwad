# Vercel Deployment Guide

## 🚀 Deploying Maraksh Cafe to Vercel

This guide will help you deploy your Maraksh Cafe Next.js application to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [MongoDB Atlas account](https://www.mongodb.com/atlas)
- GitHub repository: `https://github.com/alien2112/marakshv2.git`

## Step 1: Prepare MongoDB Atlas

1. **Create a MongoDB Atlas cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier available)
   - Choose a region close to your users

2. **Set up database access**:
   - Go to "Database Access" → "Add New Database User"
   - Create a user with read/write permissions
   - Note down the username and password

3. **Configure network access**:
   - Go to "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` to allow access from anywhere (for Vercel)

4. **Get connection string**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub: `alien2112/marakshv2`

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Domain (Optional)

1. **Add Custom Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

## Step 4: Verify Deployment

1. **Test the application**:
   - Visit your Vercel URL
   - Test all major features:
     - Homepage loads correctly
     - Menu categories display
     - Admin panel works
     - API endpoints respond

2. **Check MongoDB connection**:
   - Go to `/admin` page
   - Try adding a new category
   - Verify data is saved to MongoDB

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ❌ | `https://maraksh-cafe.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Public API URL | ❌ | `https://maraksh-cafe.vercel.app/api` |

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **MongoDB Connection Issues**:
   - Verify `MONGODB_URI` is correctly set
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

3. **API Route Errors**:
   - Check Vercel function logs
   - Verify API routes are in `app/api/` directory
   - Test API endpoints individually

4. **Image Upload Issues**:
   - Check GridFS configuration
   - Verify image upload API routes
   - Test with smaller images first

### Performance Optimization

1. **Enable Vercel Analytics**:
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Configure Caching**:
   - API routes are automatically cached
   - Static assets are cached by default
   - Consider adding cache headers for dynamic content

3. **Monitor Performance**:
   - Use Vercel Speed Insights
   - Monitor Core Web Vitals
   - Optimize images and assets

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] All pages are accessible
- [ ] Admin panel works correctly
- [ ] MongoDB connection is established
- [ ] Image uploads work
- [ ] Cart functionality works
- [ ] Mobile responsiveness is maintained
- [ ] Performance is acceptable
- [ ] SSL certificate is active
- [ ] Custom domain is configured (if applicable)

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Test locally with production environment variables
4. Check GitHub issues for similar problems

## Next Steps

After successful deployment:

1. **Set up monitoring**: Enable Vercel Analytics and Speed Insights
2. **Configure backups**: Set up MongoDB Atlas backups
3. **Add CI/CD**: Configure automatic deployments on git push
4. **Scale**: Upgrade MongoDB Atlas plan if needed
5. **Optimize**: Monitor and optimize performance

---

**Happy Deploying! 🎉**

Your Maraksh Cafe application should now be live on Vercel!
