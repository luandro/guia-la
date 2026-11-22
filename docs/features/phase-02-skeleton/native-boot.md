# Native boot evidence (task 02-14)

Date: 2026-11-22 · Environment: this Linux dev machine (no macOS hardware).

## Android — release build, local

Built and ran the release APK locally on 2026-11-22:

- `BUILD SUCCESSFUL in 23m 11s`, Gradle 9.4.1. The build auto-installed
  **Android SDK Build-Tools 37** and **Platform 37** on first run.
- Installed and launched on the **Medium_Phone_API_35** emulator image
  (x86_64).
- Application id: **`la.guia.app.development`** (APP_ENV=development — see
  the app-id rule below).

Command (from `apps/app`, with an emulator running):

```bash
APP_ENV=development APP_VARIANT=cotijuba-web npx expo run:android --variant release
```

### Build blocker found and fixed

`ANDROID_SDK_ROOT` pointed at a different SDK directory than
`ANDROID_HOME` on this machine. Gradle aborts with:

> Several environment variables and/or the `local.properties` file contain
> different paths to the SDK …

Fix: keep them equal (or export only one). With both set to the same SDK
the build proceeds normally.

### App id rule (D-01 candidate)

`la.guia.app` is the permanent id reserved for production only (and only
after the owner confirms the domain, per D-01). Every other environment
gets a suffixed id — `la.guia.app.development`, `.preview`, `.staging` —
computed in `apps/app/app.config.ts`, so a dev/staging install can never
collide with a store release.

### Screenshots

All three were taken **before** the PR #14 review fixes landed (pre-Part-1
code); they evidence native boot and the journey, not the post-fix
metadata/HTML changes (those are web-export concerns, covered by
[s1-result.md](s1-result.md)).

| File | What it shows |
| --- | --- |
| [evidence/01-home.png](evidence/01-home.png) | Launcher home: app title and the six-language picker. (The subtitle appears in German on this emulator — its language state from the same session; the static export's root page renders English.) |
| [evidence/02-list-ptBR.png](evidence/02-list-ptBR.png) | `guiala://pt-BR/places` — the pt-BR places list. |
| [evidence/03-detail-de.png](evidence/03-detail-de.png) | `guiala://de/places/praia-da-ponta-norte` — the German detail page, showing the **"Maschinell übersetzt"** machine-translation badge. |

## iOS — blocked on this machine

Blocked: **no macOS hardware** here; iOS builds need a Mac with **Xcode**
for the SDK 58 iOS target. Exact requirement once available: a macOS
machine with Xcode (current SDK 58-supported version) and the Xcode
command-line tools, then:

```bash
cd apps/app
APP_ENV=development APP_VARIANT=cotijuba-web npx expo run:ios
```

Cloud builds (EAS) are Phase 04b — not used for this evidence.
