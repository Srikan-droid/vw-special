# Valentine's Week — React

## Run locally

1. **Install dependencies** (once):
   ```bash
   npm install
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```

3. Open **http://localhost:5173** in your browser (Chrome recommended for the “say I love you” voice feature).

Edits in `src/` will hot-reload in the browser.

## GitHub Pages (automatic)

This repo has a workflow that builds and deploys on every push to `main` or `master`.

1. **Turn on Pages and set source to GitHub Actions**
   - Repo **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. Push your code (including the `.github/workflows/deploy-pages.yml` file). The workflow will build the app and deploy the `dist` folder.

3. **Use the exact URL**: `https://<your-github-username>.github.io/<repo-name>/`  
   Example: if your repo is `vw-special`, open `https://yourusername.github.io/vw-special/` (with the trailing slash if needed).  
   Find it under **Settings → Pages** after the first deploy.

4. **If the page is blank**: Open the repo **Actions** tab and confirm the latest workflow run succeeded. If it failed, fix the error and push again. Then hard-refresh the site (Ctrl+Shift+R or Cmd+Shift+R).

The app uses `base: './'`, so it works on any path.

## Mobile

React does not change how the site works on phones. The Web Speech API and layout behave the same; use Chrome on mobile for the best voice experience.
