# SHD Interior Application Task Tracker

Last updated: 22 September 2026

## Status definitions

- **Completed**: Implemented in the mobile source and available as a working local UI flow.
- **In progress**: A usable screen or partial flow exists, but required fields, history, persistence, or lifecycle actions are incomplete.
- **Pending**: Not implemented yet.

> The current project is a multi-role React Native application using local demonstration data. Company Admin, Supervisor, and Vendor users have role-specific mobile interfaces. A screen backed only by mock data is not considered a completed production feature. Backend APIs, database persistence, authentication, synchronization, and server-driven permissions remain pending. Client access is planned as a later read-only role.

## Module status summary

| Module                             | Status      | Current scope                                                            |
| ---------------------------------- | ----------- | ------------------------------------------------------------------------ |
| Application foundation             | Completed   | Modular Expo/React Native application, branding, icons, permissions      |
| Role-aware application shell       | Completed   | Persistent Admin, Supervisor, and Vendor UI/navigation selection         |
| Supervisor dashboard               | Completed   | Local dashboard and assigned-site summary                                |
| Supervisor task workflow           | In progress | Persistent local workflow complete; Admin verification pending           |
| Site progress updates              | Completed   | Persistent staged updates, media, remarks, percentage, and history table |
| Daily progress reports             | Completed   | Full local report form, evidence, persistence, and filtered history      |
| Materials and site inventory       | In progress | Request form and stock overview exist; transactions pending              |
| Attendance                         | In progress | Roster and basic form exist; time and historical records pending         |
| Expenses and cash                  | In progress | Submission form and sample ledger exist; live calculation pending        |
| Issues and support                 | In progress | Basic reporting form exists; lifecycle and history pending               |
| Messages and notifications         | In progress | Local UI exists; persistence and event delivery pending                  |
| Company Admin mobile interface     | In progress | Dashboard, project overview, approvals, and role menu use local data     |
| Vendor mobile interface            | In progress | Dashboard, purchase orders, deliveries, and role menu use local data     |
| Client mobile interface            | Pending     | Planned later as a read-only role                                        |
| Backend and production integration | Pending     | No API, authentication, sync, or server persistence                      |

## Completed

### Application foundation

- [x] Create the Expo and React Native TypeScript project.
- [x] Configure the application name as **SHD Interior**.
- [x] Configure iOS bundle identifier and Android application ID.
- [x] Organize source code into `screens`, `components`, `navigation`, `types`, data, and theme modules.
- [x] Add safe-area handling and shared visual design tokens.
- [x] Integrate Font Awesome 6 icons throughout the interface.
- [x] Configure the supplied SHD Interior app icon for the main icon, Android adaptive icon, splash screen, and web favicon.
- [x] Add image, video, and document selection support.
- [x] Add permission configuration for site photo and video selection.

### Role-aware application shell

- [x] Add persistent role selection for Company Admin, Supervisor, and Vendor.
- [x] Change the dashboard, bottom tabs, workspace identity, and menus by role.
- [x] Add Company Admin dashboard, Projects, and Approvals mobile interfaces.
- [x] Add Vendor dashboard, Purchase Orders, and Deliveries mobile interfaces.
- [x] Display multi-entry Admin and Vendor records in structured tables.
- [ ] Replace the local role selector with the authenticated user's server-assigned role.
- [ ] Add Client as a read-only role in a later phase.

### Supervisor navigation and dashboard

- [x] Add bottom navigation for Home, Tasks, Site, and Workspace.
- [x] Add the supervisor greeting and profile entry point.
- [x] Display the assigned active project and site.
- [x] Display overall project progress, start date, and target completion date.
- [x] Display today's task, workforce, and open-issue summary cards.
- [x] Add quick actions for daily reports, material requests, expenses, and issue reporting.
- [x] Add a recent site-activity summary.

### Task interface

- [x] Display assigned tasks with project area, deadline, priority, status, and completion percentage.
- [x] Add task search.
- [x] Add All, Today, In Progress, and Completed filters.
- [x] Add a dedicated Pending filter for Assigned and Blocked Supervisor tasks.
- [x] Add task detail sheets.
- [x] Add local completion-percentage selection.
- [x] Allow any task completion percentage from 0% to 100% using a continuous slider.
- [x] Add task photo, video, or document evidence selection.
- [x] Separate task photo/video evidence into Before Work, During Work, and After Work uploads.
- [x] Show only the evidence upload matching the current task stage instead of displaying every stage on every update.
- [x] Display completed tasks in the task list.
- [x] Persist task progress, status, remarks, evidence metadata, and update history locally.
- [x] Add an explicit Start Task action for assigned tasks.
- [x] Enforce 100% progress and required evidence before task completion.

### Site overview

- [x] Display current site phase, completion percentage, elapsed days, and remaining days.
- [x] Display daily workforce, completed-task, delivery, and expense summaries.
- [x] Display a recent progress-update card.
- [x] Add separate Overview, Inventory, and Attendance sections.

### Supporting local interfaces

- [x] Display current site inventory quantities and low-stock status.
- [x] Display today's worker attendance roster and status.
- [x] Add an attendance-status dropdown for Present, Absent, Half Day, and Leave.
- [x] Display a calculated cash-in-hand summary and sample transaction ledger.
- [x] Display site documents and provide document selection.
- [x] Display in-app notifications.
- [x] Display the supervisor profile and assigned site details.
- [x] Add a local Admin and Supervisor conversation interface.
- [x] Add local submission-success states for supervisor forms.

### Site progress workflow

- [x] Add a dedicated site-progress submission interface.
- [x] Add Before Work, During Work, and After Work stages.
- [x] Add site photo and progress-video selection.
- [x] Add work description, completion percentage, and daily remarks.
- [x] Allow any site completion percentage from 0% to 100% using a continuous slider.
- [x] Persist progress records locally on the device.
- [x] Display multiple historical progress records in a structured table.

## In progress

### Supervisor task management

- [x] Add explicit **Start Task** action and persist the transition from Assigned to In Progress locally.
- [x] Add Supervisor task-status controls for Assigned, In Progress, Blocked, and Completed.
- [x] Add task remarks entry and update history.
- [x] Require configured completion evidence before a task can be submitted.
- [x] Preserve progress updates when closing and reopening a task using local device storage.
- [x] Add chronological task update history.
- [x] Display multiple task updates in a structured table with date, status, progress, remark, and evidence columns.
- [ ] Add Admin-only Verified status action.
- [ ] Connect task updates to Admin review and verification.

### Site progress updates

- [x] Create a dedicated site-progress submission screen.
- [x] Separate Before Work, During Work, and After Work updates by stage.
- [x] Add progress-video selection.
- [x] Add work description, progress percentage, and daily remarks fields.
- [x] Display site progress updates chronologically in tabular form.
- [x] Preserve historical progress records locally instead of showing only the latest card.
- [ ] Synchronize site-progress history with the Admin Panel.

### Daily progress report

- [x] Add automatic date, project, site, and supervisor details.
- [x] Add validated work completed and workforce fields.
- [x] Add tasks completed and tasks pending selection.
- [x] Add separate materials used and materials required sections.
- [x] Add site-expense summary and issues faced fields.
- [x] Add separate photo and video evidence selection.
- [x] Add historical daily-report list with site and date filters.
- [x] Persist submitted reports locally on the device.
- [ ] Synchronize submitted reports with the Admin Panel.

### Material requirements

- [x] Split requested quantity and unit into dedicated fields.
- [x] Add request remarks.
- [x] Add material-request list and detail screens.
- [x] Display Submitted, Approved, Rejected, Partially Approved, Allocated, Purchased, Dispatched, and Received states.
- [x] Add complete request-status history.
- [x] Add Supervisor confirmation when dispatched material is received.
- [ ] Synchronize material requests and Admin approval actions with the backend.

### Site inventory and consumption

- [ ] Replace inventory demonstration values with persisted site stock.
- [ ] Add inventory detail and transaction history.
- [ ] Add Material Received entry.
- [ ] Add Material Used or Consumption entry with task/activity selection.
- [ ] Add Material Returned entry.
- [ ] Add Material Transfer entry.
- [ ] Add Damaged Material and Wastage entry.
- [ ] Calculate current available quantity from inventory transactions.

### Attendance

- [ ] Add attendance date, in time, out time, overtime, and remarks.
- [ ] Add Leave status.
- [ ] Support marking multiple workers efficiently.
- [ ] Add daily and historical attendance views.
- [ ] Persist attendance submissions and make them visible to Admin.

### Site expenses and local purchases

- [ ] Add expense date, payment method, and remarks fields.
- [ ] Add selectable expense categories.
- [ ] Add bill and receipt preview after selection.
- [ ] Add expense history and Pending, Approved, and Rejected states.
- [ ] Create a dedicated Local Purchase form with shop, material, quantity, amount, payment method, and receipt fields.
- [ ] Connect approved expenses and local purchases to the cash-in-hand calculation.

### Cash in hand

- [ ] Replace sample ledger values with persisted issued cash, expenses, local purchases, returns, and balance.
- [ ] Add transaction dates, references, and purpose.
- [ ] Add Cash Returned workflow.
- [ ] Prevent manual editing of the calculated balance.

### Issues and technical support

- [x] Add dropdown selection for Issue Type and Priority.
- [ ] Add separate project, site, category, priority, reported date, remarks, and status fields.
- [ ] Add dedicated Technical Support Request flow.
- [ ] Add Open, Assigned, In Progress, Resolved, and Closed lifecycle states.
- [ ] Add issue history, detail, and resolution views.
- [ ] Attach multiple photos and videos to an issue.

### Messages and notifications

- [ ] Add site-specific and project-specific conversation lists.
- [ ] Add Instruction, Material Request, Issue, Technical Support, General, and Urgent categories.
- [ ] Persist message history.
- [ ] Add message attachment support.
- [ ] Replace demonstration notifications with real event-driven notifications.
- [ ] Add read and unread state management.
- [ ] Add alerts for overdue tasks, rejected requests, report reminders, material shortages, purchase orders, and pending payments.

### Documents

- [ ] Organize documents by project, site, and category.
- [ ] Add quotations, payment documents, schedules, bills, measurement sheets, drawings, and supporting-document filters.
- [ ] Add document preview and download behavior.
- [ ] Persist uploaded documents and metadata.

## Pending

### Authentication and access

- [ ] Add sign-in and sign-out for Company Admin, Supervisor, and Vendor users.
- [ ] Add secure session handling.
- [ ] Load the signed-in Supervisor's assigned projects and sites.
- [ ] Enforce server-provided role permissions for Company Admin, Supervisor, and Vendor users.
- [ ] Add read-only Client access in a later phase.
- [ ] Add empty, loading, offline, validation, and error states across all screens.
- [ ] Add offline submission queue and later synchronization for field use.

### Supervisor activity and site visits

- [ ] Add supervisor activity timeline covering tasks, visits, reports, requests, expenses, attendance, issues, and messages.
- [ ] Add site-visit entry with visitor, date, in time, out time, purpose, remarks, and images.
- [ ] Add site-visit history.

### Company Admin mobile operations

- [x] Create the local Company Admin dashboard and role-specific mobile navigation.
- [x] Add local project-overview and pending-approval interfaces.
- [ ] Add project creation, editing, status, cost, payment, expense, site-count, and completion summaries.
- [ ] Add individual project overview with finance, sites, materials, progress, documents, client updates, and issues.
- [ ] Add site creation, editing, Supervisor assignment, and Supervisor transfer.
- [ ] Add task creation, assignment, monitoring, review, and verification.
- [ ] Add chronological progress review and daily-report review.
- [ ] Add material-request approval, rejection, partial approval, allocation, purchase, and dispatch actions.
- [ ] Add site-inventory monitoring and material-consumption reports.
- [ ] Add attendance monitoring and Supervisor activity tracking.
- [ ] Add issue assignment and resolution management.

### Central inventory and material movement

- [ ] Add central warehouse stock management.
- [ ] Add vendor material inward records.
- [ ] Add material outward and dispatch records.
- [ ] Add Warehouse-to-Site, Site-to-Warehouse, and Site-to-Site transfers.
- [ ] Add material-return records.
- [ ] Add transfer references, issuing users, receiving users, and receipt confirmation.
- [ ] Add complete inventory movement history.

### Vendors, purchasing, and challans

- [x] Add the local Vendor dashboard and role-specific mobile navigation.
- [x] Add local Purchase Orders and Deliveries interfaces.
- [ ] Add vendor list, creation, editing, status, contacts, tax, payment, and document management.
- [ ] Add vendor purchase and payment history.
- [ ] Add purchase-order creation and item entry.
- [ ] Add Draft, Approved, Sent, Partially Received, Received, Closed, and Cancelled purchase-order states.
- [ ] Add challan creation for warehouse and site movements.
- [ ] Add challan receiving confirmation.
- [ ] Add purchase-order and challan PDF generation or export.

### Contractor bills and project finance

- [ ] Add contractor bill entry with work, measurement, bill, paid, remaining, date, documents, and remarks.
- [ ] Add client payment schedules and milestones.
- [ ] Add received, remaining, upcoming, and overdue payment summaries.
- [ ] Add project cost and total-expense calculation.
- [ ] Add financial transaction history and reports.

### Client update dashboard

- [ ] Add Admin controls for selecting client-visible progress information.
- [ ] Add client-visible progress percentage, photos, milestones, current work, completed work, upcoming work, and approved reports.
- [ ] Ensure expenses, cash, attendance, and vendor transactions remain hidden unless explicitly published.
- [ ] Add the client-facing read-only dashboard.

### Data integration and production readiness

- [ ] Define and connect the mobile application API contracts.
- [ ] Replace all local demonstration data with live project and site data.
- [ ] Add persistent form submissions and media uploads.
- [ ] Add pagination and filters for historical records.
- [ ] Add server-driven validation and approval states.
- [ ] Add real-time or refresh-based data synchronization.
- [ ] Add push-notification integration.
- [ ] Add automated tests for navigation, task updates, forms, calculations, and permissions.
- [ ] Add accessibility labels and screen-reader verification.
- [ ] Add performance testing for long task, message, document, and inventory lists.
- [ ] Add Android and iOS release configuration and store metadata.

## Recommended next implementation order

1. Authentication, assigned-site loading, and API contract definitions.
2. Persisted task workflow and task-update history.
3. Daily progress reports and chronological site progress.
4. Material requests, consumption, receipt confirmation, and site inventory transactions.
5. Attendance, expenses, local purchases, and calculated cash ledger.
6. Issues, technical support, communication history, and notifications.
7. Document organization and uploads.
8. Company Admin project, site, task, approval, and monitoring modules.
9. Central inventory, vendors, purchasing, challans, contractor bills, and finance.
10. Client update dashboard, reporting, testing, and release preparation.
