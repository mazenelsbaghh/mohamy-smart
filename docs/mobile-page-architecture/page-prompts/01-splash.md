# Splash — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Entry screen for Mohamy Smart. It loads session state and routes the lawyer to onboarding, login, or home.

## Visual Prompt
Design a minimal full-screen RTL splash screen with a warm light canvas `#F0EEE7`. Center the Mohamy Smart wordmark vertically and horizontally, using Tajawal bold in near-black `#1B1B1B`. Place a small amber `#EF950A` loading mark below the brand with generous spacing. At the bottom safe area, show the short line "إدارة قانونية أكثر دقة" in muted text `#1B1B1BA6`. In dark mode use `#0A0A0A` canvas, `#F7F2E8` wordmark, and the same amber loading mark. The screen must feel calm and precise, with no illustration or decorative gradients.

## Content Blocks (Arabic copy)
- محامي سمارت
- إدارة قانونية أكثر دقة
- جار تحميل حسابك
- تعذر الاتصال، تحقق من الإنترنت

## Components Used
- Brand wordmark
- Loading indicator
- Offline message

## Interaction Notes
No manual interaction unless offline, where tapping "إعادة المحاولة" retries session refresh.

## States to Design
| State | Description |
|-------|-------------|
| normal | Brand and loading mark only |
| offline | Adds retry action near bottom |
| version-blocked | Shows update-required message |

## Linked Screens
- **Navigates from**: App launch
- **Navigates to**: Onboarding, Login, Home Dashboard

## Design Tokens Reference
Use `#F0EEE7`, `#EF950A`, `#1B1B1B`, `#0A0A0A`, Tajawal 28px/700.

