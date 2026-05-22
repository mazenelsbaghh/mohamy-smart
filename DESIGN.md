---
name: Mohamy Smart
description: Premium legal-tech platform for lawyers and administrators in the Gulf/MENA region.
colors:
  primary: "#EF950A"
  secondary: "#FBFAE8"
  background: "#F0EEE7"
  text-primary: "#1B1B1B"
  text-secondary: "#1B1B1BA6"
  success: "#34BF49"
  danger: "#CA0000"
  dark-bg: "#0A0A0A"
  dark-surface: "#1D1D1D"
typography:
  display:
    fontFamily: "Tajawal, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Tajawal, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Tajawal, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Tajawal, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Tajawal, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "16px"
  md: "24px"
spacing:
  sm: "12px"
  md: "24px"
  lg: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#d18105"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
---

# Design System: Mohamy Smart

## 1. Overview

**Creative North Star: "The Refined Quill"**

Mohamy Smart is a premium legal-tech application tailored for legal professionals and administrators in the Gulf/MENA region. It rejects the generic SaaS and sterile corporate enterprise aesthetics, drawing inspiration instead from the visual weight, precision, and elegance of high-end editorial layouts and elite legal institutions.

The visual system values generous workspace, harmonious layouts, and native RTL (Right-to-Left) designs. Spacing feels deliberate and breathing, avoiding the crammed tables and microscopic text grids of legacy systems. The entire platform scales cleanly from mobile contexts to large desktop monitors.

**Key Characteristics:**
- **RTL Native:** Built from the ground up for Arabic reading flow.
- **Sophisticated Palette:** Uses a restrained color strategy with warm neutrals and a singular vibrant amber-orange accent.
- **Clean Tyography:** Relies on Tajawal for all weights and sizes, prioritizing legibility and visual rhythm.
- **Tactile Transitions:** Interactive components react smoothly to user input, providing immediate, non-jarring feedback.

## 2. Colors

The color palette is designed to look warm, prestigious, and highly professional, utilizing warm neutrals to soften the interface while highlighting primary actions with a refined amber-orange.

### Primary
- **Orange** (`#EF950A`): Used exclusively for primary calls to action, active statuses, focal highlights, and interactive states.

### Secondary
- **Warm Cream** (`#FBFAE8`): Used for secondary backgrounds, hover states, and card fills to soften contrast.

### Neutral
- **Page Background** (`#F0EEE7`): A light, warm gray that serves as the canvas for the light mode interface.
- **Near Black** (`#1B1B1B`): The main text color, providing high contrast without the harshness of pure black.
- **Muted Charcoal** (`#1B1B1BA6` / 65% opacity): Used for supporting text, labels, and secondary context.
- **Dark Background** (`#0A0A0A`): Used as the primary canvas in dark mode.
- **Dark Surface** (`#1D1D1D`): Used for cards, panels, and dropdowns in dark mode.

### Named Rules
**The 10% Accent Rule.** The primary Orange accent is used on ≤10% of any given screen. Its rarity is what gives it visual strength and guides the user's eye to primary actions.

**No Pure Neutrals Rule.** Never use pure black (`#000000`) or pure white (`#ffffff`) as canvas backgrounds or body text. Tint neutrals with a hint of warm brand hue to maintain visual harmony.

## 3. Typography

**Display Font:** Tajawal (humanist Arabic sans-serif)
**Body Font:** Tajawal (humanist Arabic sans-serif)

Tajawal is used exclusively across the platform. Typographic hierarchy is established using weight variations and careful sizing.

### Hierarchy
- **Display** (Bold 700, `clamp(2rem, 5vw, 3rem)`, line-height 1.2): Reserved for landing page heroes, main portal headings, and large greeting banners.
- **Headline** (Bold 700, `1.75rem`, line-height 1.25): Used for main page titles and dashboard panel headers.
- **Title** (Semi-Bold 600, `1.25rem`, line-height 1.3): Used for card titles, section headings, and table headers.
- **Body** (Regular 400, `1rem`, line-height 1.6): Used for all descriptive text, emails, notes, and main messages. Line length is capped at `65-75ch` to maintain readability.
- **Label** (Medium 500, `0.875rem`, line-height 1.4): Used for forms, inputs, metadata, and supporting details.

### Named Rules
**The Single Family Rule.** The Tajawal font family is the sole typeface allowed. Contrast is generated through weight (300 to 700) and color opacity, rather than mixing font families.

## 4. Elevation

The elevation system is flat and flat-adjacent, relying on tonal contrast and thin borders to separate surfaces rather than heavy drop shadows.

### Shadow Vocabulary
- **Interactive Hover** (`box-shadow: 0 4px 20px rgba(27, 27, 27, 0.05)`): Applied to cards and buttons on hover to indicate clickability.
- **Dropdown Overlay** (`box-shadow: 0 10px 30px rgba(27, 27, 27, 0.08)`): Applied to floating components like menus, popovers, and dialogs.

### Named Rules
**The Tonal Depth Rule.** Depth is created primarily through color layering (e.g., `#ffffff` cards on a `#F0EEE7` background) rather than shadow elevation.

## 5. Components

### Buttons
- **Shape:** Rounded corners (`16px` radius).
- **Primary:** Orange (`#EF950A`) background with white text (`#ffffff`). Padding is `12px 24px` (`var(--spacing-sm)` and `var(--spacing-md)` equivalent).
- **Hover:** Darker amber (`#d18105`) with a smooth transition (`all .4s`).
- **Secondary:** Warm Cream (`#FBFAE8`) background with Near Black (`#1B1B1B`) text.

### Cards / Containers
- **Corner Style:** Highly rounded (`24px` radius).
- **Background:** White (`#ffffff`) in light mode; Dark Surface (`#1D1D1D`) in dark mode.
- **Border:** Subtle 1px border (`#1B1B1B15` or `#ffffff15` in dark mode).

### Inputs / Fields
- **Style:** Rounded (`16px` radius) with Warm Cream (`#FBFAE8`) background and subtle 1px border.
- **Focus:** Border changes to Orange (`#EF950A`) with a subtle transition.

### Navigation
- **Style:** Right-side vertical navigation panels and top bars. Navigation links use Near Black text and transition to Orange on hover/active states.

## 6. Do's and Don'ts

### Do:
- **Do** design in RTL native layout first, ensuring icons and labels flow right-to-left.
- **Do** use Tajawal exclusively across all applications.
- **Do** limit the use of the Orange brand color to focal points.
- **Do** ensure 100% color contrast compliance for text elements (WCAG AA).

### Don't:
- **Don't** use pure black `#000000` for dialog backdrops or dashboard layouts. Use `#0A0A0A` or tinted colors.
- **Don't** use side-tab accent borders (thick vertical lines on one side of cards) as they represent an AI template cliché.
- **Don't** animate CSS layout properties like `width`, `height`, `padding`, or `margin` which cause layout thrashing.
- **Don't** use generic default system fonts (like Arial or Times New Roman) as standard styles.
