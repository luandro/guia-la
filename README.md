# guia.la

Offline-first destination guides for places big platforms forget — starting
with Cotijuba island (Belém, Brazil) — as one codebase shipping an Expo
React Native app and a statically exported web build. Read the platform
spec, non-goals and vocabulary in [SPEC.md](SPEC.md).

## Prerequisites

- **Node 24** (exact range in `.nvmrc` / `package.json` engines)
- **pnpm 12.8.1** (`corepack enable` picks it up from `packageManager`)
- **pre-commit** (runs the checks + trufflehog on commit)
- **trufflehog** and **jq** (used by the pre-commit hooks)

## Clean-clone reproduction

```bash
git clone git@github.com:luandro/guia-la.git
cd guia-la
pnpm install --frozen-lockfile
pre-commit install          # once per clone
./scripts/check.sh          # docs + workspace gates; ends "check: OK"
pnpm s1                     # static web export + raw-HTML SEO assertions
pnpm dev                    # Expo dev server (flagship variant)
```

`pnpm check` (run by `./scripts/check.sh` when dependencies are installed)
is format + lint + typecheck + i18n key completeness + unit tests.

## Local Android build

With an emulator running (e.g. `Medium_Phone_API_35` via avdmanager) —
see [docs/features/phase-02-skeleton/native-boot.md](docs/features/phase-02-skeleton/native-boot.md)
for the recorded evidence:

```bash
cd apps/app
APP_ENV=development APP_VARIANT=cotijuba-web npx expo run:android --variant release
```

`APP_ENV` and `APP_VARIANT` are required (the config guard throws without
them). If both `ANDROID_SDK_ROOT` and `ANDROID_HOME` are set, they must
point at the same SDK — Gradle aborts with "Several environment variables
… contain different paths to the SDK" otherwise.

## Repository map

| Path | What lives there |
| --- | --- |
| `apps/` | `app` — the Expo Router application (web + native) |
| `packages/` | `core` (domain + content resolution), `fixtures` (synthetic destination data), `ui`, `widget-sdk` |
| `tools/` | `i18n-check` — locale catalog completeness gate (D-14) |
| `scripts/` | `check.sh`, `s1-assert.sh` + `s1-cluster-check.mjs` (raw-HTML assertions) |
| `docs/` | feature docs (`docs/features/<slug>/`), security, evidence, roadmap |
| `planning/` | decisions register and phase task sources (rendered to `docs/roadmap.md`) |

Phases and status: [docs/roadmap.md](docs/roadmap.md) · Working rules for
agents and humans: [AGENTS.md](AGENTS.md).
