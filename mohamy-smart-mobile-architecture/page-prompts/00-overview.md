# محامي سمارت — Mobile App: Design System Overview

## Project Info
- **Project Name**: محامي سمارت (Mohamy Smart)
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL (Arabic-first)
- **Product Type**: Legal-Tech SaaS — AI-Powered Lawyer Mobile App
- **Target Audience**: محامون مصريون وعرب يستخدمون التطبيق أثناء التنقل — في المحاكم، المكاتب، وبين الجلسات

## Brand Personality
**ثلاث كلمات**: راقي، أنيق، دقيق — Refined, Elegant, Precise

- **Refined**: لا شيء زائد. كل عنصر يبرر وجوده.
- **Elegant**: هارموني بصري مع مساحات بيضاء سخية وانتقالات ناعمة.
- **Precise**: التفاصيل مهمة — المحاذاة والتباعد والتباين غير قابلة للتفاوض.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary / Brand | `#EF950A` | CTAs, active states, accents, FABs |
| Secondary / Warm | `#FBFAE8` | Card backgrounds, hover/press states |
| Page Background (Light) | `#F0EEE7` | App background |
| Title Text | `#1B1B1B` | Primary headings |
| Body Text | `#1B1B1BA6` | Secondary text (65% opacity) |
| Surface (Light) | `#FFFFFF` | Cards, sheets, modals |
| Success | `#34BF49` | Active badges, success states |
| Danger | `#CA0000` | Errors, destructive actions |
| Dark Surface | `#0A0A0A` | Dark mode background |
| Dark Card | `#1D1D1D` | Dark mode cards |
| Dark Elevated | `#2A2A2A` | Dark mode elevated surfaces |

## Typography

| Level | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| Display | Tajawal | 700 | 28-32px | Screen titles |
| H1 | Tajawal | 700 | 22-24px | Section headings |
| H2 | Tajawal | 600 | 18-20px | Card titles |
| H3 | Tajawal | 600 | 16px | Sub-sections |
| Body Large | Tajawal | 400 | 16px | Primary content |
| Body | Tajawal | 400 | 14px | Standard text |
| Body Small | Tajawal | 400 | 12px | Secondary info |
| Caption | Tajawal | 500 | 11px | Labels, timestamps |
| Button | Tajawal | 700 | 14-16px | All buttons |
| Overline | Tajawal | 600 | 10px | Category labels (uppercase tracking) |

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Inline gaps |
| `sm` | 8px | Tight spacing |
| `md` | 12px | Standard internal padding |
| `lg` | 16px | Card padding, section gaps |
| `xl` | 20px | Between sections |
| `2xl` | 24px | Screen horizontal padding |
| `3xl` | 32px | Major section separators |
| `4xl` | 48px | Top/bottom safe areas |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 8px | Small badges, chips |
| `md` | 12px | Inputs, small cards |
| `lg` | 16px | Standard cards |
| `xl` | 20px | Large cards, bottom sheets |
| `full` | 999px | Pill buttons, avatars, FABs |

## Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Cards at rest |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Elevated cards, FAB |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Bottom sheets, modals |
| `shadow-none` | none | Flat elements in dark mode |

## Icon Style
- **Library**: Lucide Icons (primary) + Ionicons 5 (supplementary)
- **Size**: 20-24px standard, 16px inline, 28-32px feature icons
- **Stroke**: 1.5-2px
- **Color**: Inherits text color, accent color for active states

## Animation Guidelines
- **Duration**: 200-400ms for micro-interactions, 300-500ms for page transitions
- **Easing**: `ease-out` for enters, `ease-in` for exits
- **Haptic**: Light haptic on button press, medium on success
- **Respect**: `prefers-reduced-motion` must be honored
- **Transitions**: Shared element transitions between list → detail pages
- **Pull-to-refresh**: Custom branded animation

## Navigation Pattern
- **Primary**: Bottom Navigation Bar (4-5 items)
- **Secondary**: Stack navigation with back gesture
- **Tertiary**: Top Tabs within screens
- **Modals**: Bottom sheets for quick actions

## Complete Page List

| # | File | Page Name |
|---|------|-----------|
| 01 | [01-splash.md](./01-splash.md) | Splash Screen |
| 02 | [02-onboarding.md](./02-onboarding.md) | Onboarding |
| 03 | [03-login.md](./03-login.md) | Login |
| 04 | [04-signup.md](./04-signup.md) | Sign Up |
| 05 | [05-forgot-password.md](./05-forgot-password.md) | Forgot Password |
| 06 | [06-home.md](./06-home.md) | Home Dashboard |
| 07 | [07-cases-list.md](./07-cases-list.md) | Cases List |
| 08 | [08-case-details.md](./08-case-details.md) | Case Details |
| 09 | [09-workflow-selection.md](./09-workflow-selection.md) | Workflow Selection |
| 10 | [10-ai-workflow.md](./10-ai-workflow.md) | AI Workflow Steps |
| 11 | [11-clients-list.md](./11-clients-list.md) | Clients List |
| 12 | [12-client-details.md](./12-client-details.md) | Client Details |
| 13 | [13-documents.md](./13-documents.md) | Documents / OCR |
| 14 | [14-agenda.md](./14-agenda.md) | Agenda / Calendar |
| 15 | [15-ai-chat.md](./15-ai-chat.md) | AI Chat |
| 16 | [16-notifications.md](./16-notifications.md) | Notifications |
| 17 | [17-settings.md](./17-settings.md) | Settings |
| 18 | [18-subscription.md](./18-subscription.md) | Subscription Plans |
