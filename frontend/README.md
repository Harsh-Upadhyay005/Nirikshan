# Nirikshan Frontend

React 19 and TypeScript dashboard for the Nirikshan infrastructure project
risk monitoring platform. It is built with Vite and consumes the FastAPI
backend for authentication, health checks, lookups, projects, alerts, and
dashboard data.

## Requirements

- Node.js 20 or newer
- A running Nirikshan backend, locally or remotely

## Local Development

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Set `VITE_API_URL` in `.env` when the backend is not available at the same
origin:

```env
VITE_API_URL=http://localhost:8000
```

## Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build in dist/
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

## Deployment

The frontend can be deployed as a static site on Render, Netlify, or Vercel.
Use `frontend` as the project root, then configure:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://your-backend-url`

Add the deployed frontend URL to the backend's `CORS_ORIGINS` JSON array.

## Structure

```text
src/
  api.ts             API client and session helpers
  App.tsx            Application routes
  components/        Landing, dashboard, map, and shared UI components
  pages/             Application pages
  data/              Local dashboard display data
public/              Static assets, including India GeoJSON
```
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
