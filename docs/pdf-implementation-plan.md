# Closing Engage PDF Implementation Plan

## Screen Inventory

- Splash/onboarding: three panels with logo, skip, visual tile, dots, and blue CTA.
- Auth: login with logo, email/password, forgot password, and demo role selector.
- Signing Company: home dashboard, orders list, create order, order details, documents list, document view, team management, add member, settings/profile.
- Notary: home dashboard, assigned list, order details, schedule closing, chat, upload documents, credentials, settings/profile.

## Role Navigation

- Unboarded users start at `/onboarding`.
- Onboarding completion routes to `/auth/login`.
- Demo login routes company users to `/company/home` and notary users to `/notary/home`.
- `/company/*` and `/notary/*` layouts protect against cross-role access.

## Shared Design System

- Primary action/nav blue, pale blue-gray app background, white cards, navy headings, muted gray copy.
- Soft borders, compact 8-12px card radii, restrained shadows, safe-area layout, and bottom tabs.
- Status badges use blue, green, orange, red, and gray semantic tones.

## Reusable Components

- App shell: `ScreenContainer`, `AppHeader`, `AppText`.
- Controls: `AppButton`, `AppInput`, `Badge`, `ToggleRow`.
- Data surfaces: `AppCard`, `SectionHeader`, `OrderCard`, `DocumentCard`, `TeamMemberCard`, `OrderStatusTimeline`, `ProgressPipeline`, `ChatBubble`, `UploadBox`.

## Data Models

- `User`, `Order`, `DocumentFile`, `TeamMember`, `Message`, `Credential`.
- Mock data is centralized in `src/constants/mockData.ts`.
- Screens consume service-shaped modules in `src/services` so backend calls can replace mocks later.

## Implementation Order

1. Scaffold Expo TypeScript app and configure Expo Router.
2. Add environment config, aliases, linting, formatting, EAS config, and `.gitignore`.
3. Build theme tokens and typed mock/service layer.
4. Build shared components.
5. Build onboarding/auth and role guards.
6. Build company screens.
7. Build notary screens.
8. Validate with TypeScript and ESLint.
