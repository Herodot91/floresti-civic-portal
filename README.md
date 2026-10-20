# Florești Civic Portal

A prototype civic portal for a fictional city. A citizen signs in and sees city projects, taxes, utilities,
transport card and benefits in one place. All data is fictional.

**Live demo:** https://herodot91.github.io/floresti-civic-portal/
(Sign in with any code of 4 or more characters. The sign-in is simulated.)

Originally created in Google AI Studio: [ppk1991/Citizen-App](https://github.com/ppk1991/Citizen-App).
This repository adds a real API layer, API standards checks, and deployment to GitHub Pages.

## The API

The portal loads everything through a small read-only REST API under `/api/v1`.
The API is described in [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3).

| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/user.json` | The citizen's profile |
| GET | `/api/v1/projects.json` | City projects with milestones |
| GET | `/api/v1/transport.json` | The transport card |
| GET | `/api/v1/taxes.json` | Taxes |
| GET | `/api/v1/utilities.json` | Utilities |
| GET | `/api/v1/benefits.json` | Benefits |

The responses are JSON files in [`public/api/v1`](public/api/v1), published next to the app. That is why the paths
end in `.json` and why only `GET` exists. Paying a tax, topping up a card or switching auto-pay changes the open page
only. Nothing is written back. The client is [`services/api.ts`](services/api.ts).

## API standards, checked in GitHub Actions

- **Spectral** checks the spec against Spectral's OpenAPI rules plus 11 house rules in
  [`.spectral.yaml`](.spectral.yaml): versioned paths, kebab-case paths, camelCase properties, PascalCase schema names,
  every property described, every response has an example, GET only.
- **Contract test** ([`tools/contract-test.mjs`](tools/contract-test.mjs)) checks that every JSON file matches its schema
  in the spec, that every example matches too, and that no file is served without being documented.

## Run locally

```bash
npm install
npm run dev
```

Check the API standards:

```bash
npx @stoplight/spectral-cli@6.17.0 lint docs/openapi.yaml
npm install --prefix tools --no-save ajv@8.17.1 ajv-formats@3.0.1 js-yaml@4.1.0
node tools/contract-test.mjs
```

## What changed from the AI Studio export

- Data now comes from the API instead of being imported from `data/mockData.ts`. That file is kept as the source the JSON files were generated from.
- `index.html` loads `index.tsx` (AI Studio did this itself) and no longer uses an import map.
- `vite.config.ts` sets the Pages base path and no longer injects a `GEMINI_API_KEY` into the browser bundle. Nothing used it.
