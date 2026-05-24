# Plan: Clarify Facts Modal Mobile Text Overflow & Alignment Fixes

This plan addresses visual styling, text wrapping, alignment, and overflow issues on mobile viewports within the Clarify Facts Modal (`ClarifyFactsModal.tsx`).

## Proposed Changes

### 1. Options Container Alignment & Margins (`ClarifyFactsModal.tsx`)
- **Problem**: The options container has `className="flex flex-col gap-2 me-10"`.
  - `me-10` is an RTL layout bug (adds margin-left instead of margin-right), causing options to align with the number's right edge rather than starting under the question text, and squeezing the buttons from the left.
  - On mobile (width 320px), this 40px margin excessively squashes the buttons, leaving only ~192px width.
- **Solution**:
  - Change `me-10` to `sm:ms-10 ms-0`.
  - On mobile, `ms-0` lets buttons occupy the full card width, preventing aggressive text wrapping.
  - On desktop, `sm:ms-10` properly indents the options from the right (start) to align under the question text.

### 2. Custom Answer Textarea Width & Margin (`ClarifyFactsModal.tsx`)
- **Problem**: The textarea inside the options container has `w-full mt-1 me-8`.
  - `me-8` (margin-left: 32px) combined with `w-full` (width: 100%) causes the textarea to overflow its parent container on the left by 32px.
- **Solution**:
  - Change `me-8` to `ms-8` (to indent it from the right/start, aligning with the custom option text).
  - Change `w-full` to `w-[calc(100%-2rem)]` (to reduce width by 32px / 2rem, preventing left-side overflow).

### 3. Option Button Alignment & Layout (`ClarifyFactsModal.tsx`)
- **Problem**:
  - The option buttons use `text-end` (which aligns text to the left in RTL, contrary to Arabic reading order).
  - The buttons use `items-center` (which vertically centers the checkbox circle). For multiline text, `items-start` is a much cleaner alignment as the checkbox circle aligns with the first line of text rather than floating in the middle of a tall box.
- **Solution**:
  - Change `text-end` to `text-start` on both option buttons and the custom button.
  - Change `items-center` to `items-start` on the buttons, and add a small top margin to the checkbox circle (`mt-0.5` or similar) to align perfectly with the first line of text.

## Verification Plan

### Automated/Lint Checks
- Run tests and linting to ensure no regressions:
  ```bash
  npm test && npm run lint
  ```

### Manual Verification
- View the app in a mobile viewport (e.g. 320px or 375px) in Chrome DevTools.
- Verify that the Clarify Facts Modal options:
  1. Have no left-side overflow.
  2. The custom textarea is indented correctly and does not bleed out of the card.
  3. Option text wraps naturally and is fully visible without clipping at the bottom border.
  4. Buttons are aligned correctly underneath the question text on desktop.
