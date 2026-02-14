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

3. Open **http://localhost:5173** in your browser (Chrome recommended for the "say I love you" voice feature).

Edits in `src/` will hot-reload in the browser.

## GitHub Pages (use gh-pages branch)

A workflow builds the app and pushes the **built** files to the **gh-pages** branch on every push to `main`.

1. Push your code (including `.github/workflows/deploy-gh-pages-branch.yml`). The workflow will create or update the **gh-pages** branch with the built site.

2. **Settings** → **Pages** → **Source**: **Deploy from a branch** → **Branch**: **gh-pages** → **/ (root)** → Save.

3. Wait 1–2 minutes, then open **https://srikan-droid.github.io/vw-special/**  
   If gh-pages did not exist yet, the first workflow run creates it; then set the branch as in step 2.

## Mobile

React does not change how the site works on phones. The Web Speech API and layout behave the same; use Chrome on mobile for the best voice experience.
