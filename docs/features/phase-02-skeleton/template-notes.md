# Template notes: what `default@sdk-58` ships (task 02-3)

Scaffolded 2026-11-22 with `npx create-expo-app@latest apps/app --template
default@sdk-58 --no-install --no-agents-md -y` (create-expo-app 5.0.0).
Flags: `--no-install` skips dependency install (pnpm owns installs from the
workspace root); `--no-agents-md` skips the template's own AGENTS.md and
`.claude/settings.json` because this repo has its own governance files.
No nested `.git` was created ("Skipped initializing Git repository, already
inside one").

## Versions (apps/app/package.json)

| Package                                                                                                                    | Version                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| expo                                                                                                                       | ~58.0.26 (alias `default@sdk-58` still resolves to SDK 58) |
| expo-router                                                                                                                | ~58.0.32                                                   |
| react / react-dom                                                                                                          | 19.3.0                                                     |
| react-native                                                                                                               | 0.88.1                                                     |
| react-native-web                                                                                                           | ~0.21.4                                                    |
| react-native-reanimated / worklets                                                                                         | 4.7.1 / 0.13.0                                             |
| react-native-screens / safe-area-context / gesture-handler                                                                 | ~4.30.1 / ~5.11.1 / ~3.3.0                                 |
| @expo/ui                                                                                                                   | ~58.0.29                                                   |
| expo-* (constants, device, font, glass-effect, image, linking, splash-screen, status-bar, symbols, system-ui, web-browser) | ~58.x / ~58.1.x                                            |
| typescript (dev)                                                                                                           | ~6.0.3                                                     |
| @types/react (dev)                                                                                                         | ~19.3.0                                                    |

Matches the research baseline ([expo-stack §1.1](../../../planning/research/expo-stack.md)).

## Folders and files

- `src/app/` — route tree already under `src/` (matches the canonical layout):
  `index.tsx` (home tab), `explore.tsx` (explore tab), `_layout.tsx`
  (tab layout with theme provider, splash overlay, React Compiler on).
- `src/components/` — tutorial components (app-tabs + `.web.tsx` variant,
  animated-icon + `.web.tsx` + CSS module, themed-text/view, collapsible,
  external-link, hint-row, web-badge).
- `src/constants/theme.ts`, `src/hooks/` (use-color-scheme + `.web.tsx`,
  use-theme), `src/global.css`.
- `assets/` — expo icon set, splash/icon/favicon images, tab icons,
  react/expo logos.
- `app.json` — slug `app`, scheme `app`, `web.output: "server"` (task 02-7
  will set `"static"` explicitly and add env validation; untouched here),
  plugins `expo-router` + `expo-splash-screen`, experiments
  `typedRoutes: true` and `reactCompiler: true`.
- `tsconfig.json` — extends `expo/tsconfig.base`, `strict: true`, path
  aliases `@/*` → `./src/*`, `@/assets/*`.
- `.gitignore` — node_modules, `.expo/`, `dist/`, `web-build/`, native
  artifacts, `.env*.local`, generated `ios/`/`android/`, plus `example/`
  (created by reset-project). The template also ignored `expo-env.d.ts`;
  Phase 02 un-ignores and commits it so `tsc --noEmit` works on a clean
  clone without running the Expo CLI first (see below).
- `scripts/reset-project.js` — interactive helper that moves `src/` and
  `scripts/` into `example/` and recreates a blank app; safe to delete after
  use (kept until the skeleton replaces the tutorial screens).
- `README.md`, `LICENSE` (template's own MIT text), `.vscode/` — template
  boilerplate; the repo-root README/LICENSE remain authoritative.
- `package.json` scripts: `start`, `reset-project`, `android`, `ios`, `web`,
  `lint` (`expo lint`).

## Example screens

Two-tab tutorial app: Home (index) shows a styled greeting, step links and an
expo-badge image; Explore shows a collapsible list of resources. Splash uses
an animated overlay on native and a CSS-module variant on web
(`animated-icon.web.tsx`), demonstrating the platform-split pattern this repo
will reuse.

## Deviations from stock scaffold

- `--no-install` + `--no-agents-md` (above); installs move to pnpm at the
  workspace root (task 02-4).
- Template name/slug `app` left as shipped; renaming to the guia.la identity
  belongs to task 02-7 (app config), not this task.
- `expo-env.d.ts` committed (un-ignored): the template generates it only when
  the Expo CLI runs and gitignores it; committing the standard one-line
  reference (`expo/types`) makes `tsc --noEmit` deterministic on a clean
  clone. `expo/types` provides the `*.module.css` / `*.css` module
  declarations the template code imports.
- `src/components/app-tabs.web.tsx`: cast of `TabTriggerSlotProps` to
  `PressableProps` — expo-router/ui types the trigger `ref` as a ref to a
  View-like component, incompatible with react-native-web's `Pressable` ref
  under `tsc --noEmit` (template code, type error shipped in the template).
- `src/hooks/use-color-scheme.web.ts`: hydration flag rewritten from
  `useEffect` + `setState` to `useSyncExternalStore` — the shipped code fails
  the `react-hooks/set-state-in-effect` rule of the current
  eslint-plugin-react-hooks.

## Workspace decisions (task 02-4/02-5)

- **pnpm node-linker: isolated (the pnpm default; no `.npmrc`).**
  docs.expo.dev/guides/monorepos (fetched 2026-11-22): "From SDK 54, Expo
  supports isolated dependencies and isolated installations"; SDK 58 is past
  that, and isolated installs enforce declared dependencies (no phantom
  hoisted deps). Documented fallback if a library breaks: switch to
  `nodeLinker: hoisted` in pnpm-workspace.yaml. `expo-doctor` validated the
  install ("All checks passed").
- **ESLint 9, not 10**: eslint-config-expo 58.0.4 (peer `eslint >=8.10`) pulls
  eslint-plugin-react 7.37.x, which crashes on ESLint 10's removed context
  API (`getFilename is not a function`). Pinned `eslint ^9.39.0`; revisit
  when eslint-config-expo ships ESLint 10 support.
- **TypeScript ~6.0.3** everywhere (the template's own pin), including
  package devDependencies, so `pnpm -r typecheck` works under isolated
  installs without relying on root hoisting.

