# Angular 22 CLI Commands – BankLoan Project

## Project Architecture Overview

This project follows a scalable, modular architecture to ensure separation of concerns and maintainability.

*   **`environments/`**: Contains configuration files for different build environments (e.g., development, production, staging). It stores API URLs, feature flags, and environment-specific variables.
*   **`core/`**: Contains singletons, application-wide configurations, and globally used services that should only be instantiated once.
    *   **`constants/`**: Stores global static variables and magic numbers (e.g., API endpoints, regex patterns, roles).
    *   **`guards/`**: Route guards that control access to specific routes based on authentication or authorization.
    *   **`interceptors/`**: HTTP interceptors used to modify incoming/outgoing requests (e.g., attaching JWT tokens, global error handling).
    *   **`models/`**: TypeScript interfaces and classes defining the data structures used across the application.
    *   **`services/`**: Global singleton services providing logic and data state management (e.g., AuthService).
*   **`features/`**: Contains independent, self-contained feature modules or smart components (pages) that make up the main functionality of the application.
    *   **`auth/`**, **`dashboard/`**, **`loans/`**, **`profile/`**: Specific domains or areas of the app, containing their own routing, pages, and sometimes scoped components.
*   **`layouts/`**: Contains shell components that provide the structural wrapping for the application's pages.
    *   **`auth-layout/`**: A minimal layout wrapper used for public-facing pages like login and registration (e.g., no sidebar).
    *   **`main-layout/`**: The primary authenticated layout wrapping the dashboard and content (e.g., includes navbar and sidebar).
*   **`shared/`**: Contains reusable, presentational (dumb) UI components, directives, and pipes that are shared across different features.
    *   **`components/`**: Reusable generic components (e.g., `header`, `sidebar`, `loader`, custom buttons, tables) that have no strict dependency on any specific feature domain.

---

## Application Development Lifecycle

Follow these sequential phases for developing the BankLoan application from scratch to full completion:

### Phase 1: Skeleton & Scaffolding
1. **Initialize Project**: Generate the Angular app and configure environments.
2. **Generate Folder Structure**: Create the basic directories (`core`, `features`, `layouts`, `shared`).
3. **Generate Layouts**: Create the `auth-layout` and `main-layout` to serve as the application's shells.
4. **Generate Shared Components**: Build the structural UI elements like `header`, `sidebar`, and `loader`.

### Phase 2: Feature Generation & Routing
1. **Generate Feature Pages**: Create the standalone components for `auth` (login, register), `dashboard`, `loans` (list, apply, details), and `profile`.
2. **Setup Application Routing**: Map the generated feature pages to their respective layouts using Angular's Router.
    * Route public paths (login/register) through `auth-layout`.
    * Route protected paths (dashboard, loans, profile) through `main-layout`.

### Phase 3: Core Architecture & Data Models
1. **Define Models**: Create TypeScript interfaces (e.g., `user.model.ts`, `auth.model.ts`) to strongly type incoming and outgoing data.
2. **Setup Constants**: Define application-wide static variables, API endpoints, and regex validation patterns in `constants.ts`.
3. **Generate Services**: Build out the HTTP abstraction layer (e.g., `auth.service.ts`, `loan.service.ts`) to communicate with the backend APIs.

### Phase 4: Security & Interception
1. **Setup Route Guards**: Implement `auth.guard.ts` to protect authenticated routes and redirect unauthenticated users to the login page.
2. **Implement Interceptors**: Build `auth.interceptor.ts` to automatically attach JWT tokens to outgoing API requests and globally catch HTTP errors (like 401 Unauthorized).

### Phase 5: UI Implementation & State Integration
1. **Develop Shared UI**: Style and implement the responsive header, navigation sidebar, and dynamic loading spinners.
2. **Build Feature Views**: Implement the HTML templates and CSS/SCSS for all feature pages (forms, tables, dashboards).
3. **Integrate Services**: Inject the core services into the feature components to bind real data to the UI, handling loading states and error messages.

### Phase 6: Testing & Optimization
1. **Unit Testing**: Write tests for services, guards, interceptors, and complex components.
2. **Performance Tuning**: Implement lazy loading for routes, optimize change detection (OnPush), and verify bundle sizes.
3. **Environment Configuration**: Finalize `environment.development.ts` and `environment.ts` for final deployment builds.

---

## 1. Core Architecture

### 1.1 Constants

Angular CLI does not have a `constant` generator.

**Create folder:**

```bash
mkdir src/app/core/constants
```

**Create file:**

```bash
type nul > src/app/core/constants/constants.ts
```

> Windows CMD command.

Expected file:

```text
src/app/core/constants/constants.ts
```

---

### 1.2 Auth Guard

**Full command:**

```bash
ng generate guard core/guards/auth 
```

**Shortcut:**

```bash
ng g g core/guards/auth 
```

Expected file:

```text
src/app/core/guards/auth.guard.ts
```

---

### 1.3 Auth Interceptor

**Full command:**

```bash
ng generate interceptor core/interceptors/auth 
```

**Shortcut:**

```bash
ng g interceptor core/interceptors/auth 
```

Expected file:

```text
src/app/core/interceptors/auth.interceptor.ts
```

---

### 1.4 Auth Service

**Full command:**

```bash
ng generate service core/services/auth --type=service
```

**Shortcut:**

```bash
ng g s core/services/auth --type=service
```

Expected file:

```text
src/app/core/services/auth.service.ts
```

---

### 1.5 Environments

**Full command:**

```bash
ng generate environments
```

**Shortcut:**

```bash
ng g environments
```

Expected files:

```text
src/environments/environment.ts
src/environments/environment.development.ts
```

---

## 2. Core Models

### 2.1 Auth Model

For a TypeScript interface/model file, use the interface generator.

**Full command:**

```bash
ng generate interface core/models/auth --type=model
```

**Shortcut:**

```bash
ng g i core/models/auth --type=model
```

Expected file:

```text
src/app/core/models/auth.model.ts
```

---

### 2.2 User Model

**Full command:**

```bash
ng generate interface core/models/user --type=model
```

**Shortcut:**

```bash
ng g i core/models/user --type=model
```

Expected file:

```text
src/app/core/models/user.model.ts
```

---

## 3. Feature Pages

For your project, pages are generated as standalone Angular components.

### 3.1 Login

**Full command:**

```bash
ng generate component features/auth/login --type=page
```

**Shortcut:**

```bash
ng g c features/auth/login --type=page
```

Expected:

```text
features/auth/login/
├── login.page.ts
├── login.page.html
├── login.page.css
└── login.page.spec.ts
```

---

### 3.2 Register

**Full command:**

```bash
ng generate component features/auth/register --type=page
```

**Shortcut:**

```bash
ng g c features/auth/register --type=page
```

Expected:

```text
features/auth/register/
├── register.page.ts
├── register.page.html
├── register.page.css
└── register.page.spec.ts
```

---

### 3.3 Dashboard

**Full command:**

```bash
ng generate component features/dashboard --type=page
```

**Shortcut:**

```bash
ng g c features/dashboard --type=page
```

Expected:

```text
features/dashboard/
├── dashboard.page.ts
├── dashboard.page.html
├── dashboard.page.css
└── dashboard.page.spec.ts
```

---

### 3.4 Loan List

**Full command:**

```bash
ng generate component features/loans/loan-list --type=page
```

**Shortcut:**

```bash
ng g c features/loans/loan-list --type=page
```

Expected:

```text
features/loans/loan-list/
├── loan-list.page.ts
├── loan-list.page.html
├── loan-list.page.css
└── loan-list.page.spec.ts
```

---

### 3.5 Loan Apply

**Full command:**

```bash
ng generate component features/loans/loan-apply --type=page
```

**Shortcut:**

```bash
ng g c features/loans/loan-apply --type=page
```

Expected:

```text
features/loans/loan-apply/
├── loan-apply.page.ts
├── loan-apply.page.html
├── loan-apply.page.css
└── loan-apply.page.spec.ts
```

---

### 3.6 Loan Details

**Full command:**

```bash
ng generate component features/loans/loan-details --type=page
```

**Shortcut:**

```bash
ng g c features/loans/loan-details --type=page
```

Expected:

```text
features/loans/loan-details/
├── loan-details.page.ts
├── loan-details.page.html
├── loan-details.page.css
└── loan-details.page.spec.ts
```

---

### 3.7 Profile

**Full command:**

```bash
ng generate component features/profile --type=page
```

**Shortcut:**

```bash
ng g c features/profile --type=page
```

Expected:

```text
features/profile/
├── profile.page.ts
├── profile.page.html
├── profile.page.css
└── profile.page.spec.ts
```

---

# 4. Layouts

## 4.1 Auth Layout

**Full command:**

```bash
ng generate component layouts/auth-layout --type=layout
```

**Shortcut:**

```bash
ng g c layouts/auth-layout --type=layout
```

Expected:

```text
layouts/auth-layout/
├── auth-layout.layout.ts
├── auth-layout.layout.html
├── auth-layout.layout.css
└── auth-layout.layout.spec.ts
```

---

## 4.2 Main Layout

**Full command:**

```bash
ng generate component layouts/main-layout --type=layout
```

**Shortcut:**

```bash
ng g c layouts/main-layout --type=layout
```

Expected:

```text
layouts/main-layout/
├── main-layout.layout.ts
├── main-layout.layout.html
├── main-layout.layout.css
└── main-layout.layout.spec.ts
```

---

# 5. Shared Components

## 5.1 Header

**Full command:**

```bash
ng generate component shared/components/header --type=component
```

**Shortcut:**

```bash
ng g c shared/components/header --type=component
```

Expected:

```text
shared/components/header/
├── header.component.ts
├── header.component.html
├── header.component.css
└── header.component.spec.ts
```

---

## 5.2 Sidebar

**Full command:**

```bash
ng generate component shared/components/sidebar --type=component
```

**Shortcut:**

```bash
ng g c shared/components/sidebar --type=component
```

Expected:

```text
shared/components/sidebar/
├── sidebar.component.ts
├── sidebar.component.html
├── sidebar.component.css
└── sidebar.component.spec.ts
```

---

## 5.3 Loader

**Full command:**

```bash
ng generate component shared/components/loader --type=component
```

**Shortcut:**

```bash
ng g c shared/components/loader --type=component
```

Expected:

```text
shared/components/loader/
├── loader.component.ts
├── loader.component.html
├── loader.component.css
└── loader.component.spec.ts
```

---

# 6. Important Angular CLI Shortcuts

| Purpose     | Full Command              | Shortcut           |
| ----------- | ------------------------- | ------------------ |
| Component   | `ng generate component`   | `ng g c`           |
| Service     | `ng generate service`     | `ng g s`           |
| Guard       | `ng generate guard`       | `ng g g`           |
| Interface   | `ng generate interface`   | `ng g i`           |
| Interceptor | `ng generate interceptor` | `ng g interceptor` |
| Directive   | `ng generate directive`   | `ng g d`           |
| Pipe        | `ng generate pipe`        | `ng g p`           |
| Enum        | `ng generate enum`        | `ng g e`           |
| Class       | `ng generate class`       | `ng g cl`          |
| Module      | `ng generate module`      | `ng g m`           |
| Environments| `ng generate environments`| `ng g environments`|

---

# 7. Complete Generation Order

Run the commands in this order when creating the project structure.

## Step 0 – Environments

```bash
ng g environments
```

---

## Step 1 – Constants

```bash
mkdir src/app/core/constants
```

```bash
type nul > src/app/core/constants/constants.ts
```

---

## Step 2 – Models

```bash
ng g i core/models/auth --type=model
ng g i core/models/user --type=model
```

---

## Step 3 – Services

```bash
ng g s core/services/auth --type=service
```

---

## Step 4 – Guard

```bash
ng g g core/guards/auth 
```

---

## Step 5 – Interceptor

```bash
ng g interceptor core/interceptors/auth 
```

---

## Step 6 – Auth Pages

```bash
ng g c features/auth/login --type=page
ng g c features/auth/register --type=page
```

---

## Step 7 – Dashboard

```bash
ng g c features/dashboard --type=page
```

---

## Step 8 – Loan Pages

```bash
ng g c features/loans/loan-list --type=page
ng g c features/loans/loan-apply --type=page
ng g c features/loans/loan-details --type=page
```

---

## Step 9 – Profile

```bash
ng g c features/profile --type=page
```

---

## Step 10 – Layouts

```bash
ng g c layouts/auth-layout --type=layout
ng g c layouts/main-layout --type=layout
```

---

## Step 11 – Shared Components

```bash
ng g c shared/components/header --type=component
ng g c shared/components/sidebar --type=component
ng g c shared/components/loader --type=component
```

---

# 8. Constants File – Important

**Do NOT use:**

```bash
ng g c core/constants/constants --type=constant
```

Because:

```text
ng g c
```

means:

```text
ng generate component
```

Therefore Angular generates:

```text
constants.ts
constants.html
constants.css
constants.spec.ts
```

That is why you received multiple files.

For a constants file, create only:

```text
constants.ts
```

using:

```bash
mkdir src/app/core/constants
type nul > src/app/core/constants/constants.ts
```

Final result:

```text
core/
└── constants/
    └── constants.ts
```

---

# 9. Final BankLoan Structure

```text
src/
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
│
└── app/
    │
    ├── core/
    │   ├── constants/
    │   │   └── constants.ts
    │   │
    │   ├── guards/
    │   │   └── auth.guard.ts
    │   │
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts
    │   │
    │   ├── models/
    │   │   ├── auth.model.ts
    │   │   └── user.model.ts
    │   │
    │   └── services/
    │       └── auth.service.ts
    │
    ├── features/
    │   ├── auth/
    │   │   ├── login/
    │   │   └── register/
    │   │
    │   ├── dashboard/
    │   │
    │   ├── loans/
    │   │   ├── loan-list/
    │   │   ├── loan-apply/
    │   │   └── loan-details/
    │   │
    │   └── profile/
    │
    ├── layouts/
    │   ├── auth-layout/
    │   └── main-layout/
    │
    └── shared/
        └── components/
            ├── header/
            ├── sidebar/
            └── loader/
```

## Important Note

The `--type` option changes the generated filename suffix, but it **does not change what generator you are using**.

For example:

```bash
ng g c
```

always generates a **component**.

So:

```bash
ng g c login --type=page
```

means:

> Generate a component named `login`, but use the `.page.ts` suffix.

It does **not** mean "generate a page as a completely different Angular artifact."

For `constants.ts`, there is no appropriate Angular CLI generator, so manual file creation is the clean approach.
