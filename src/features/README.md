# Feature Structure

This app has two primary dashboard domains:

- `company/`: signing company workflows such as home, orders, documents, and team management.
- `notary/`: notary workflows such as assigned orders, order details, scheduling, chat, documents, credentials, and settings.

Keep route files in `app/` thin. They should only import and render a screen from `src/features/...`.

Recommended feature layout:

```text
src/features/<domain>/
  components/       # Components only used by this domain
  screens/          # Route-level screens for this domain
  styles.ts         # Domain-specific shared styles, when needed
```

Shared UI belongs in `src/components/common`. Cross-domain business types stay in `src/types`, and temporary demo data stays in `src/constants/mockData.ts` until replaced by services.

Do not add new screens to a generic catch-all file. Create or extend the correct feature module instead.
