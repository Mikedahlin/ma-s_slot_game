# FREE Setup Guide: Lynne's AI Slot Deluxe

## 🎰 What You're Setting Up
A browser-based slot machine game with:
- Slot gameplay with bonus rounds
- Optional AI-powered themes and stories (OpenAI)
- Works completely offline without AI features
- Can be deployed free online

---

## 📋 STEP 1: Check Your System

### You MUST have:
- **Node.js version 20 or newer** 
- **Git** installed
- **A web browser** (Chrome, Firefox, Edge, etc.)

### Check Node.js version:
```bash
node --version
```
If you see version 20.x.x or higher, you're good. If not, download from nodejs.org

### Check Git:
```bash
git --version
```
If you see a version number, you're set.

---

## 📁 STEP 2: Prepare the Project Folder

### Navigate to your project:
```bash
cd "c:\Users\harle\Documents\ma's_slot_game"
```

### Install required packages:
```bash
npm install
```
Wait for this to complete. It will download everything needed.

---

## 🔑 STEP 3: Set Up Environment (Optional for AI features)

### Copy the environment template:
```bash
copy .env.example .env
```

### For FREE setup (no AI costs):
- You can skip editing `.env` entirely
- The game will work with built-in themes and stories
- This is completely free

### For AI features (costs money):
- Get an OpenAI API key from platform.openai.com
- Edit the `.env` file and replace `your_openai_api_key_here` with your actual key
- This will cost money when you use AI features

---

## 🚀 STEP 4: Run Locally (Test Everything Works)

### Start the game server:
```bash
npm run dev
```

### What you should see:
- Server starting message
- Something like "Server running on port 3000"

### Open your browser and go to:
```
http://localhost:3000
```

### Test the game:
1. You should see the slot machine interface
2. Click the spin button - reels should spin
3. Try the bonus rounds
4. If you didn't set up OpenAI, AI buttons will use free fallback content

---

## 🌐 STEP 5: Deploy Online (FREE Option)

### Option A: Railway (Easiest - Everything in one place)

1. **Create GitHub Account** (if you don't have one)
   - Go to github.com and sign up for free

2. **Create Railway Account** (if you don't have one)
   - Go to railway.app and sign up with GitHub
   - You get $5 free credit per month - enough for this

3. **Push to GitHub** (one-time setup):
   ```bash
   git init
   git add .
   git commit -m "Initial setup"
   git branch -M main
   ```
   Then create a new repository on GitHub and:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
   git push -u origin main
   ```

4. **Deploy to Railway**:
   - In Railway, click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect and deploy

5. **Get your URL**:
   - Railway will give you a URL like `https://your-app.up.railway.app`
   - That's your live game URL!

### Option B: GitHub Pages (Frontend only - FREE forever)

1. **Enable GitHub Pages**:
   - In your GitHub repo, go to Settings → Pages
   - Source: "Deploy from branch"
   - Branch: main, folder: / (root)
   - Click Save

2. **Your game will be live at**:
   `https://YOUR_USERNAME.github.io/your-repo-name`

---

## ✅ STEP 6: Verify Everything Works

### Test your deployed game:
1. Open your Railway or GitHub Pages URL
2. The slot machine should load
3. Try spinning - should work immediately
4. AI features will use free content if no API key

### If something doesn't work:
- **Can't spin?** Check browser console for errors (F12 → Console)
- **White screen?** Make sure all files are uploaded
- **AI buttons don't work?** That's normal without API key - they use free content

---

## 💰 COST BREAKDOWN

### Completely FREE:
- Local play: $0
- GitHub Pages hosting: $0 (forever)
- Railway hosting: $0 (within $5 monthly free tier)

### With AI features:
- OpenAI API: ~$0.002 per AI theme/story generation
- Railway hosting: $0 (within free tier)
- Total: Only pay when you actually use AI features

---

## 🆘 TROUBLESHOOTING

### "Command not found" errors:
- Make sure Node.js is installed and in your PATH
- Try restarting your terminal/command prompt

### "Port already in use":
- Another program is using port 3000
- Edit `.env` and change `PORT=3000` to `PORT=3001`
- Then go to `http://localhost:3001`

### Game loads but doesn't work:
- Check browser console (F12) for error messages
- Make sure all files are in the same folder

### Railway deployment fails:
- Make sure your `package.json` has the correct start script
- Check Railway logs for specific error messages

---

## 🎉 YOU'RE DONE!

You now have:
✅ A working slot game locally
✅ Free online hosting (Railway or GitHub Pages)
✅ Optional AI features (if you want to pay for them)

### Next steps:
- Customize the game by editing `styles.css` for colors
- Modify game logic in `script.js`
- Add your own themes and stories

### Need help?
- Check the existing `DEPLOY.md` for advanced options
- Look at the code comments in each file
- Each file explains what it does

---

**Enjoy your free slot game! 🎰**
