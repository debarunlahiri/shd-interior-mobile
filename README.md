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
- Central typed localization dictionary for shared interface copy and dynamic text parameters

## Technology

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Vector Icons, native haptics and native-safe-area support
- Font Awesome 6 icon system throughout the interface

## Project structure

```text
src/
  components/    Reusable UI, dialogs, tables, dropdowns, date/OTP fields, tabs and sheets
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

The current version intentionally contains no API, database, production
authentication or cloud storage integration.

## Localization

Shared interface copy is defined in `src/localization/index.tsx` and consumed
through `useTranslation()`. Add new user-facing text as a typed translation key
instead of placing reusable copy directly in components. Dynamic values use
named parameters such as `{role}` or `{phone}`. English is currently the default
locale; additional dictionaries can be added without changing component layouts.
