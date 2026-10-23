# Guluru's Revenge 🩴 — React

A one-screen, Angry Birds-style apology game. Aliva drags back and flings chappals, pillows, teddies and a frying pan at Srikant, who hides behind forts built from his flaws (DUMB, DOESN'T EXPRESS, NEVER TEXTS FIRST…). Every bonk knocks a sorry out of him. Three levels, then one last throw (a heart) and a letter.

- All wording (levels, flaw labels, his sorry lines, finale) lives in `src/game/levels.js`.
- The letter text is in `src/components/ThrowGame.jsx`.
- Physics: matter-js. Sounds are synthesized with WebAudio (no audio files).
- Add `?autoplay` to the URL to let the game aim for you (used for testing).

## Run locally

1. **Install dependencies** (once):
   ```bash
   npm install
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```

3. Open **http://localhost:5173** in your browser.

Edits in `src/` will hot-reload in the browser.

## GitHub Pages (use gh-pages branch)

A workflow builds the app and pushes the **built** files to the **gh-pages** branch on every push to `main`.

1. Push your code (including `.github/workflows/deploy-gh-pages-branch.yml`). The workflow will create or update the **gh-pages** branch with the built site.

2. **Settings** → **Pages** → **Source**: **Deploy from a branch** → **Branch**: **gh-pages** → **/ (root)** → Save.

3. Wait 1–2 minutes, then open **https://srikan-droid.github.io/vw-special/**  
   If gh-pages did not exist yet, the first workflow run creates it; then set the branch as in step 2.

## Mobile

Built for phones first: tap targets, safe-area padding, and light vibration feedback (on Android).
