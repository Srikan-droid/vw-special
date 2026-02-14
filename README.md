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

## Build for GitHub Pages

1. Build:
   ```bash
   npm run build
   ```

2. Deploy the **`dist`** folder to GitHub Pages:
   - Either enable GitHub Pages for this repo and set the source to the `dist` folder (e.g. via a `gh-pages` branch or GitHub Actions),  
   - Or copy the contents of `dist` into the root of a branch that GitHub Pages serves (e.g. `main` or `gh-pages`).

The app uses `base: './'`, so it works on any path (e.g. `username.github.io/repo-name/`).

## Mobile

React does not change how the site works on phones. The Web Speech API and layout behave the same; use Chrome on mobile for the best voice experience.
