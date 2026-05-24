# Plan: Mobile Button and Toast Layout Fixes

This plan addresses visual truncation and clipping issues on mobile viewports for:
1. The analysis button on the Documents page.
2. The `sileo` library toast notifications.

## Proposed Changes

### 1. Documents Page Button Wrapping (`Documents.css`)
- **Problem**: The analysis button "تحليل المستند تفصيلياً وإنشاء قضية جديدة" inside the Documents page is cut off on mobile viewports (e.g., width 320px) because it has `white-space: nowrap;` and a fixed height.
- **Solution**:
  - Add a responsive override in `Documents.css` inside `section.documents` for mobile viewports (`max-width: 640px`).
  - Target `button` elements to use `white-space: normal !important;`, `height: auto !important;`, a `min-height: 3rem;`, and adequate padding (`padding-top: 0.75rem; padding-bottom: 0.75rem;`) so that long text wraps neatly onto multiple lines and does not overflow the button boundaries.

### 2. Sileo Toast Mobile Responsiveness (`index.css`)
- **Problem**: Sileo toasts (`sileo`) have a fixed width of `350px`, causing them to overflow small screens (like 320px viewport). Furthermore, the toast title has `white-space: nowrap;` and the header has a fixed height with hidden overflow, causing long status text to get cut off.
- **Solution**:
  - Update `index.css` inside the `lawyer-dashboard` to override Sileo styles on mobile screens (`max-width: 480px`).
  - Override `--sileo-width` and `[data-sileo-toast]` width to use a fluid viewport-based size (`calc(100vw - 1.5rem) !important`).
  - Override `height: auto !important` on both `[data-sileo-toast]` and `[data-sileo-header]` so they grow dynamically to fit wrapped content.
  - Set `white-space: normal !important` and `flex-wrap: wrap !important` on `[data-sileo-header-inner]` to allow text wrapping.
  - Slightly scale down `[data-sileo-title]` font size to `0.76rem` on mobile.

## Verification Plan

### Lint & Build Checks
- Run the build/lint validation script:
  ```bash
  npm run lint
  ```

### Manual Verification
- Render the lawyer dashboard on a mobile viewport (320px width) in Chrome DevTools:
  - Verify that the Document analysis button wraps its text completely and displays "تحليل المستند تفصيلياً وإنشاء قضية جديدة" in full without getting truncated.
  - Trigger toast notifications (e.g., starting document OCR analysis) and verify that the toast bubble fits within the screen borders and long status messages wrap/display completely.
