# Moroccan Images Upload Configuration

## Setup Instructions

1. **Get GitHub Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Copy the token

2. **Set Environment Variables:**
   ```bash
   export GITHUB_TOKEN="your_token_here"
   ```

3. **Update Repository Settings:**
   Edit `scripts/upload-moroccan-images.js` and update:
   ```javascript
   const REPO_OWNER = 'your_github_username';
   const REPO_NAME = 'marakshv2';
   ```

4. **Run the Upload Script:**
   ```bash
   node scripts/upload-moroccan-images.js
   ```

## What the Script Does

### 📁 **Folder Structure Processing:**
- Scans `public/صور مراكش/` folder
- Processes subfolders: الشاي, العصيرات الطبيعية, القهوة الباردة, المكتيلز والمهيتو
- Maps Arabic category names to English prefixes

### 🏷️ **Filename Normalization:**
- Converts Arabic names to GitHub-friendly format
- Removes special characters, keeps Arabic letters
- Replaces spaces with hyphens
- Adds category prefixes

### 📤 **GitHub Upload:**
- Uploads images to `public/images/moroccan-food/` in your repo
- Checks for existing files to avoid duplicates
- Handles rate limiting with delays

### 🔄 **Database Integration:**
- Generates `update-moroccan-images-db.js` script
- Updates menu items with new GitHub image URLs
- Uses regex matching to find items by name

## Example Transformations

| Original File | GitHub Path |
|---------------|-------------|
| `شاي أتاي.jpg` | `public/images/moroccan-food/tea-شاي-أتاي.jpg` |
| `عصير افوكادو.jpg` | `public/images/moroccan-food/natural-juices-عصير-افوكادو.jpg` |
| `ايس موكا.jpg` | `public/images/moroccan-food/cold-coffee-ايس-موكا.jpg` |

## Generated Database URLs

Images will be accessible at:
```
https://raw.githubusercontent.com/YOUR_USERNAME/marakshv2/master/public/images/moroccan-food/FILENAME
```

## Troubleshooting

- **Rate Limiting:** Script includes 1-second delays between uploads
- **Authentication:** Make sure GitHub token has `repo` permissions
- **File Conflicts:** Script checks for existing files before uploading
- **Arabic Support:** Uses Unicode normalization for Arabic characters







