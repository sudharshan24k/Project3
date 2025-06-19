# Frontend Structure: Dashboard & Forms

## Main Landing Page
- The main landing page is a **Dashboard** (`/src/app/components/dashboard/`).
- The dashboard displays 10 buttons, each routing to a different form page (`/forms/form1` to `/forms/form10`).

## Forms
- All form components are in `/src/app/components/forms/`.
- Each form is a standalone Angular component: `form1.component.ts`, ..., `form10.component.ts`.
- Each form is routed via `/forms/formN` (N = 1..10).
- Example: `/forms/form3` loads `Form3Component`.

## Routing
- See `app.routes.ts` for route definitions. Each form uses lazy loading for performance and maintainability.
- The dashboard is the default route (`/`).

## Team Collaboration
- Each developer can own one form component for parallel development.
- Keep shared logic in `/src/app/services/` or `/src/app/models/` as needed.
- UI elements shared across forms should go in `/src/app/components/shared/` (create if needed).

## Folder Structure
```
components/
  dashboard/
    dashboard.component.ts
  forms/
    form1.component.ts
    form2.component.ts
    ...
    form10.component.ts
```

## How to Add More Forms
- Add a new `formN.component.ts` in `forms/`.
- Add a route in `app.routes.ts` for `/forms/formN`.
- Add a button in the dashboard if needed.

---
This structure supports a 10-person team, with clear separation and easy scalability. 