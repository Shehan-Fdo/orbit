# Orbit Get Started (Master Guide)

This is the central onboarding document for Orbit. Use it as your start-to-finish roadmap, then jump into focused docs as needed.

## Documentation Map

- Deep contributor workflow (this file): `get-started.md`
- Content writing and structure rules: `docs/content-authoring.md`
- Build internals and code architecture: `docs/architecture.md`
- Production release and hosting checklist: `docs/deployment.md`

## 10-Minute Setup

1. Install Node.js 18+ (Node 20 LTS recommended).
2. From project root, install dependencies:

```bash
npm install
```

3. Build once:

```bash
npm run build
```

4. Preview generated output:

```bash
npm run preview
```

5. Open:

- `http://127.0.0.1:5500`

PowerShell custom port:

```powershell
$env:PORT=8080; npm run preview
```

## Day-to-Day Workflow (Start to End)

1. Start watch mode while editing:

```bash
npm run dev
```

2. Work on:

- content: `src/pages`
- styles: `src/styles`
- assets: `public`
- rendering/build logic: `main.js`, `layout.js`, `utils.js`, `.orbit/.sidebar/sidebar.js`

3. Validate changes:

```bash
npm run lint
npm run seo:check
npm run build
```

4. Preview final build:

```bash
npm run preview
```

5. Commit source changes (not `dist`, which is ignored).
6. Deploy `dist` with your hosting pipeline.

## What to Read Next

- If you are creating or editing learning pages:
  - read `docs/content-authoring.md`
- If you are changing route logic, sidebar logic, or build behavior:
  - read `docs/architecture.md`
- If you are preparing production publish:
  - read `docs/deployment.md`

## Commands Quick Reference

```bash
npm install
npm run dev
npm run build
npm run preview
npm run seo:check
npm run lint
```

