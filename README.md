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
```

Set `EXPO_PUBLIC_API_URL` to your backend URL when the API is available.

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

- iOS: `com.closingengage.mobile`
- Android: `com.closingengage.mobile`

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
