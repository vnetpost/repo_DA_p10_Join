# Join

Join is a standalone Angular application for task management with authentication, board workflows, contacts, summary dashboards, and image attachments for tasks.

## Tech Stack

- Angular 20
- Angular Router
- Angular Forms
- Angular Fire
- Firebase Authentication
- Firebase Firestore
- SCSS
- Viewer.js
- Flatpickr

## Local Development

Start the local dev server:

```bash
ng serve
```

Open:

```text
http://localhost:4200/
```

## Build

Create a production build:

```bash
ng build
```

The build output is generated in:

```text
dist/join/browser
```

## Tests

Run unit tests:

```bash
ng test
```

## Routing Overview

Main routes defined in `src/app/app.routes.ts`:

- `/` -> Login / signup page
- `/summary` -> Summary dashboard
- `/add-task` -> Routed add-task page
- `/board` -> Task board
- `/contacts` -> Contacts feature
- `/help` -> Help page
- `/privacy` -> Privacy page
- `/imprint` -> Imprint page

## Architecture

The app follows a feature-based structure.

- `main-page/` contains the authenticated product areas and the auth landing page
- larger features are split into:
  - `components/`
  - `services/`
  - `state/`
  - `utils/`
- shared reusable logic lives in `shared/`

## Component Tree

```text
src/app
├── app
│   └── App
├── help-page
│   └── HelpPage
├── imprint
│   └── Imprint
├── privacy
│   └── Privacy
├── main-page
│   ├── MainPage
│   ├── components
│   │   ├── LoginFormCard
│   │   ├── SignupFormCard
│   │   ├── MainPageBranding
│   │   └── MainPageMobileGreeting
│   ├── summary
│   │   ├── Summary
│   │   └── SummaryMetrics
│   ├── add-task
│   │   ├── AddTask
│   │   └── components
│   │       ├── AddTaskFormField
│   │       ├── AddTaskPriority
│   │       ├── AddTaskCategory
│   │       ├── AddTaskAssignee
│   │       ├── AddTaskSubtasks
│   │       └── AddTaskAttachment
│   ├── board
│   │   ├── Board
│   │   └── components
│   │       ├── BoardTaskList
│   │       │   └── BoardTaskCard
│   │       └── BoardTaskDialog
│   │           └── components
│   │               ├── BoardTaskDialogAssignees
│   │               ├── BoardTaskDialogAttachments
│   │               └── BoardTaskDialogSubtasks
│   └── contacts
│       ├── Contacts
│       └── components
│           ├── ContactList
│           │   └── ContactListItem
│           ├── ContactDetail
│           │   └── ContactDetailProfile
│           └── ContactDialog
│               └── components
│                   ├── ContactDialogAvatar
│                   └── ContactDialogFormFields
└── shared
    └── components
        ├── Cockpit
        └── Header
```

## Feature Structure

### Auth / Landing

Path:

```text
src/app/main-page
```

Responsibilities:

- login
- signup
- branding / greeting animations
- auth submit handling

### Add Task

Path:

```text
src/app/main-page/add-task
```

Responsibilities:

- create and edit tasks
- validation
- close confirmation for overlay and routed mode
- attachment uploads with preview and limits

Local structure:

```text
add-task/
├── components/
├── services/
├── state/
└── utils/
```

### Board

Path:

```text
src/app/main-page/board
```

Responsibilities:

- task board columns
- drag and drop
- task dialog
- add-task overlay integration

Local structure:

```text
board/
├── components/
│   ├── board-task-list/
│   └── board-task-dialog/
└── state/
```

### Contacts

Path:

```text
src/app/main-page/contacts
```

Responsibilities:

- contact list
- contact details
- contact dialog
- mobile detail flow and delete confirmation

Local structure:

```text
contacts/
├── components/
│   ├── contact-list/
│   ├── contact-detail/
│   └── contact-dialog/
└── state/
```

## Shared Layer

Path:

```text
src/app/shared
```

Contains:

- reusable layout components
- auth and Firestore services
- attachment processing / viewer services
- guards
- interfaces
- shared utilities
- Flatpickr directive

## Firebase Hosting

The app includes Firebase Hosting SPA rewrites in:

- `firebase.json`

This is required so direct route calls like `/summary`, `/board`, or `/contacts` resolve to `index.html` instead of returning `404`.
