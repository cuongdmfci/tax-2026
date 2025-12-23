<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Hmjidf0ugpG2TyQKxzqW3jYUKoBZZM80

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Published site

The site is published to GitHub Pages at:

https://cuongdmfci.github.io/tax-2026/

If the site does not appear after the first successful workflow run, check the Actions run logs and the repository Pages settings. The workflow expects the production build to output into `dist/` (Vite default). If your build output folder is different, update the workflow `path:` accordingly.
