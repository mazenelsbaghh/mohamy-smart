# Replace react-hot-toast with Sileo

## Objective
Replace all instances of `react-hot-toast` across the `mohamy smart` applications with the physics-based `sileo` toast component based on user request.

## Steps
1. **Uninstall/Install Dependencies**:
   - Uninstall `react-hot-toast` from `admin-dashboard`, `lawyer-dashboard`, and `landing` packages.
   - Install `sileo` in `admin-dashboard`, `lawyer-dashboard`, and `landing` packages.
2. **Update Provider/Layouts**:
   - Update `apps/admin-dashboard/src/main.tsx` to use `sileo`'s `<Toaster>`.
   - Update `apps/lawyer-dashboard/src/layout/Layout.tsx` to use `sileo`'s `<Toaster>`.
3. **Update Toast Helpers**:
   - Update `apps/admin-dashboard/src/utils/toastHelpers.ts` to use `sileo` API instead of `toast`.
4. **Refactor Usages**:
   - For all files importing `react-hot-toast`, change the import to `import { sileo } from 'sileo'`.
   - Update function calls from `toast.success`, `toast.error`, etc. to `sileo.success`, `sileo.error`.
   - Adapt `toast.promise` to `sileo.promise` and update options (e.g. `loading: { title: "..." }`).
5. **Verify Types**:
   - Ensure `sileo` options are correctly structured (uses `title` instead of string messages, though description works too or whatever the API dictates). Wait, `sileo` options: `{ title?: string; description?: string }`. So `toast.success("msg")` becomes `sileo.success({ title: "msg" })` or similar. Let's make it `title` for brevity.
