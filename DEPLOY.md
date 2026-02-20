# Fix 404 for src/main.jsx — GitHub Pages checklist

The 404 happens because **Pages is serving the wrong branch** (source code instead of the built site).

## Do this in order

### 1. Confirm the workflow ran
- Go to: **https://github.com/srikan-droid/vw-special/actions**
- Find the workflow **"Build and push to gh-pages"**
- It must have a **green check** (success). If it’s red or missing, push a commit to `main` and wait for it to run.

### 2. Confirm the gh-pages branch exists
- Go to: **https://github.com/srikan-droid/vw-special**
- Click the branch dropdown (it probably says **main**)
- You should see **gh-pages** in the list. If you don’t, the workflow from step 1 didn’t run or failed.

### 3. Point Pages at gh-pages (this fixes the 404)
- Go to: **https://github.com/srikan-droid/vw-special/settings/pages**
- Under **Build and deployment**:
  - **Source**: select **Deploy from a branch**
  - **Branch**: select **gh-pages** (not “main”)
  - **Folder**: **/ (root)**
- Click **Save**

### 4. Open the site
- Wait 1–2 minutes
- Open: **https://srikan-droid.github.io/vw-special/**
- Hard refresh (Ctrl+Shift+R) or use an incognito window

---

If **Branch** in Settings → Pages is set to **main**, you will always get the 404 for `src/main.jsx`. It must be **gh-pages**.
