# SHD Interior

A role-aware React Native application for construction and interior project operations.

## Included mobile flows

- Phone and OTP login with role-specific Admin, Supervisor and Vendor accounts
- Role-specific dashboards, bottom navigation and workspace menus
- Supervisor dashboard with active site, progress, workforce, tasks and open issues
- Assigned task list with search, status filters, details, haptic progress controls and evidence entry
- Site overview with progress updates, inventory levels and worker attendance
- Persistent daily site reports with task selection, evidence and filtered history
- Persistent material requests with lifecycle history and receipt confirmation
- Persistent site inventory with received, used, returned, transferred and damaged movements
- Expenses and issue reporting
- Admin project overview and approval queues
- Vendor purchase-order and delivery tracking
- Notifications, profile, cash-in-hand summary, messages and documents entry points
- Local mock data and submission states so the app can be reviewed without a backend
- Shared SQLite demo database linking Admin, Supervisor and Vendor workflows
- SQLite-backed purchase orders, deliveries, operational records and audit events
- Offline-first change queue with real-time internet status and automatic retry
- Central typed localization dictionary for shared interface copy and dynamic text parameters

## Technology

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo SQLite with WAL mode and foreign-key enforcement
- Expo Vector Icons, native haptics and native-safe-area support
- Font Awesome 6 icon system throughout the interface

## Project structure

```text
src/
  components/    Reusable UI, dialogs, tables, dropdowns, date/OTP fields, tabs and sheets
  database/      SQLite schema, migration, shared state storage and audit trail
  sync/          Network monitoring, durable outbox and remote synchronization
  navigation/    Application navigation state and screen composition
  config/        Role-specific navigation configuration
  hooks/         Local task, site-progress and user-role state
  localization/  Shared locale dictionaries, typed keys and translation provider
  screens/       Supervisor, Admin, Vendor and shared workspace screens
  types/         Navigation, roles and Font Awesome icon types
  data.ts        Local demonstration data
  theme.ts       Shared colours, spacing and visual tokens
```

## Local development

Use Node.js 22.13 or newer (Node.js 21 is not supported by this React Native version).

```sh
npm install
npm start
```

## Demo login accounts

Use the common demo OTP `123456` after entering one of these phone numbers:

| Role       | Phone number |
| ---------- | ------------ |
| Admin      | `9000000001` |
| Supervisor | `9000000002` |
| Vendor     | `9000000003` |

Each phone number opens only its assigned role interface. These accounts and
the OTP are local demonstration credentials; production authentication, OTP
delivery and server permissions still require backend integration. Client
access is planned as a later read-only role.

The demo uses an on-device SQLite database. Production authentication and cloud
storage still require backend integration.

## Offline sync

Every operational change is saved locally first and added to a durable SQLite
outbox. The app monitors real internet reachability, shows the current network
and queue state, retries failed batches with backoff, and resumes automatically
after the app returns to the foreground or the device reconnects. A queued
change is removed only after the server explicitly acknowledges its mutation
ID, so closing the app or losing the network does not discard pending work.

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` when an API becomes
available. With no URL configured, synchronization stays safely paused and all
queued changes remain on the device.

The client sends `POST {EXPO_PUBLIC_API_URL}/mobile/sync` with this contract:

```json
{
  "client": "shd-interior-mobile",
  "cursor": null,
  "mutations": [
    {
      "id": "SYNC-unique-id",
      "entityType": "app_state",
      "entityId": "storage-key",
      "operation": "upsert",
      "payload": {},
      "actorRole": "Supervisor",
      "createdAt": "2026-09-25T10:00:00.000Z"
    }
  ]
}
```

The API should treat each mutation ID as idempotent and return explicit
acknowledgements plus optional server changes:

```json
{
  "acknowledgedIds": ["SYNC-unique-id"],
  "serverCursor": "next-cursor",
  "changes": []
}
```

## Localization

Shared interface copy is defined in `src/localization/index.tsx` and consumed
through `useTranslation()`. Add new user-facing text as a typed translation key
instead of placing reusable copy directly in components. Dynamic values use
named parameters such as `{role}` or `{phone}`. English is currently the default
locale; additional dictionaries can be added without changing component layouts.
