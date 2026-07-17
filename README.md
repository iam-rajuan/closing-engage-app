# Closing Engage Mobile

Production-ready Expo React Native TypeScript app implementing the Closing Engage company and notary mobile flows from the provided PDF.

## Requirements

- Node.js 20+
- npm
- Expo CLI through `npx expo`
- Expo Go for device testing, or Android Studio/Xcode for native simulators

## Installation

```bash
npm install
```

## Environment Setup

```bash
cp .env.example .env
cp .env.local.example .env.local
```

Put shared defaults in `.env`, and put machine-specific values in `.env.local`.

Set `EXPO_PUBLIC_API_URL` in `.env.local` to your backend URL when the API is available.

## Run

```bash
npm start
npm run android
npm run ios
npm run web
```

Use Expo Go by scanning the QR code from `npm start`.

## Validation

```bash
npm run typecheck
npm run lint
```

## Build With EAS

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
eas build --profile production --platform all
```

Bundle identifiers are configured in `app.config.ts`:

- iOS: `com.closingengage.app`
- Android: `com.closingengage.app`

`app.config.ts` is the authoritative Expo application config for this repository. There is no `app.json`, and none should be created unless the project intentionally changes architecture.

## Native Folders

- `android/` and `ios/` are generated native outputs, not source-of-truth folders.
- `android/` exists locally but is not currently tracked by Git.
- `ios/` is not currently checked in.
- If you delete them locally, regenerate with `npx expo prebuild --clean` or through an EAS build.
- Durable native configuration should live in `app.config.ts` or config plugins, not in local native folders.

## Permissions

App permissions are declared in `app.config.ts`, so they stay with the repo even when native folders are regenerated.

Current declarations are:

- Android: `INTERNET`, `READ_EXTERNAL_STORAGE`, `VIBRATE`, and `POST_NOTIFICATIONS`
- Android blocked: `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, and `SYSTEM_ALERT_WINDOW`
- iOS: photo library usage description for image/document uploads

This matches the current code paths:

- Document picking uses `expo-document-picker`
- Avatar/image picking uses `expo-image-picker`
- File downloads use `expo-file-system` and Storage Access Framework on Android
- Download notifications use `expo-notifications`

## Release Policy

- `eas build` is the production build path for iOS and Android.
- `scripts/assemble-release.ps1` is now explicitly a local testing-only helper because a generated Android release can still inherit debug signing when native folders are unmanaged by Git.

## Demo Login Roles

The login screen includes a role selector:

- Signing Company routes to the company dashboard and company tabs.
- Notary routes to the notary dashboard and notary tabs.

Routes are protected in `app/company/_layout.tsx` and `app/notary/_layout.tsx`.

## Project Structure

- `app/`: Expo Router routes and tab layouts.
- `src/components/`: shared UI and feature components.
- `src/constants/mockData.ts`: centralized typed demo data.
- `src/features/auth/`: auth store and auth types.
- `src/features/screens/`: concrete screen implementations.
- `src/services/`: backend-ready service layer.
- `src/theme/`: colors, spacing, radius, typography, and shadows.
- `src/types/`: shared TypeScript domain models.
- `src/utils/`: validation, formatting, and file picking helpers.

## Backend Integration

Replace mock returns in `src/services/*.service.ts` with `api` calls from `src/services/api.ts`. Token injection and response-error normalization placeholders are already present in the Axios interceptors.
