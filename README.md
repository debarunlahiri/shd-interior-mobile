# SHD Interior

A role-aware React Native application for construction and interior project operations.

## Included mobile flows

- Persistent role selection for Company Admin, Supervisor and Vendor users
- Role-specific dashboards, bottom navigation and workspace menus
- Supervisor dashboard with active site, progress, workforce, tasks and open issues
- Assigned task list with search, status filters, details, progress and evidence entry
- Site overview with progress updates, inventory levels and worker attendance
- Daily site reports, material requests, expenses and issue reporting
- Admin project overview and approval queues
- Vendor purchase-order and delivery tracking
- Notifications, profile, cash-in-hand summary, messages and documents entry points
- Local mock data and submission states so the app can be reviewed without a backend

## Technology

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Vector Icons and native-safe-area support
- Font Awesome 6 icon system throughout the interface

## Project structure

```text
src/
  components/    Reusable UI, common dropdown, tabs, task cards and modal sheets
  navigation/    Application navigation state and screen composition
  config/        Role-specific navigation configuration
  hooks/         Local task, site-progress and user-role state
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

The current role selector simulates the signed-in user for local UI review. The
production role will come from authentication and server permissions. Client
access is planned as a later read-only role.

The current version intentionally contains no API, database, authentication or
cloud storage integration.
