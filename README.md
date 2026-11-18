# Maheen Hassan, product portfolio

A static website built with React, TypeScript and Tailwind CSS. `npm run build` writes the complete site to `dist/`, which any static host can serve. It is set up for Vercel.

## Requirements

- Node.js 18 or newer (22 recommended). Check with `node -v`.

## Run it on your computer

```bash
npm install        # installs the exact versions in package-lock.json
npm run build      # builds the site into dist/
npm run preview    # serves dist/ at http://localhost:3000
```

After any change to the content or code, run `npm run build` again and refresh the browser.

## Deploy to Vercel

1. Push this folder to a GitHub repository (see "Upload to GitHub" below).
2. Go to vercel.com, sign in with GitHub, and choose **Add New… → Project**.
3. Import the repository. Vercel reads `vercel.json`, so the settings fill in automatically:
   - Framework preset: **Other**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Choose **Deploy**. Your site appears at a free address ending in `.vercel.app`.

Vercel tells the build its own address, so the sharing preview image and sitemap use the right URL automatically. If you add a custom domain later, add an environment variable in Vercel (**Settings → Environment Variables**) named `SITE_URL` with the full address, for example `https://www.example.com`, then redeploy.

Every time you push a change to the `main` branch, Vercel rebuilds and publishes the site within about a minute.

### Upload to GitHub without the command line

1. On github.com, choose **New repository**. Name it, for example, `portfolio`. Leave "Add a README" unticked. Create it.
2. On the empty repository page, choose **uploading an existing file**.
3. Drag in everything inside this folder (not the folder itself): `src`, `public`, `build.mjs`, `index.html`, `package.json`, `package-lock.json`, `vercel.json`, `tsconfig.json`, `README.md`, `.gitignore`, `.nvmrc`. Do not upload `node_modules` or `dist`.
4. Choose **Commit changes**.

Files starting with a dot (`.gitignore`, `.nvmrc`) may be hidden on your computer. On a Mac, press Cmd + Shift + . in Finder to show them. They are helpful but not required.

## Making updates

| To change | Edit |
| --- | --- |
| A case study's text, outcomes or images | `src/content/projects.ts` |
| Product Lab descriptions | `src/content/lab.ts` |
| Name, headline, LinkedIn address | `src/content/site.ts` |
| Homepage sections and capability list | `src/pages/Home.tsx` |
| About, Resume, Contact and Product Lab pages | `src/pages/Other.tsx` |
| Colours and fonts | `src/styles.css` (the `@theme` block) |
| Page title, description and sharing text | `index.html` |
| Images | `public/images/` (then reference them in `projects.ts`) |

Every outcome in `projects.ts` has a `credit` label: `owned`, `led`, `team`, `contributed` or `company`. Keep it accurate when adding results.

On GitHub you can edit a file directly: open it, choose the pencil icon, make the change and commit. Vercel redeploys automatically.

## How it works

- `build.mjs` bundles `src/main.tsx` with esbuild, generates only the Tailwind CSS classes the source uses, copies `public/`, and writes `index.html`.
- Pages use hash addresses (`#work`, `#work-ggu-edvisor-ai`, `#about`), so direct links work on any static host without server configuration.
- TypeScript is compiled by esbuild, which strips types without checking them. For type checking in your editor, run `npm install -D typescript @types/react @types/react-dom` and then `npx tsc`.

## Troubleshooting

- **`npm install` fails with an integrity error:** delete `package-lock.json`, run `npm install` again, and commit the new lockfile.
- **The live site shows an old version:** check the latest deployment in the Vercel dashboard. A failed build keeps the previous version online; its log shows the error.
