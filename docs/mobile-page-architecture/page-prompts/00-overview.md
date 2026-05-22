# Mohamy Smart Mobile — UI Design Prompt Overview

## Project

Mohamy Smart is a premium Arabic legal-tech mobile app for lawyers in the Gulf/MENA region. It manages cases, clients, sessions, documents, subscriptions, AI points, and AI-assisted legal drafting workflows.

## Platform

- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Primary screen size**: 390x844
- **Large phone size**: 430x932

## Design Tokens

### Colors
- Primary amber: `#EF950A`
- Primary hover/pressed: `#D18105`
- Warm cream: `#FBFAE8`
- Light canvas: `#F0EEE7`
- Light card: `#FFFEFA`
- Text primary: `#1B1B1B`
- Text secondary: `#1B1B1BA6`
- Border light: `#1B1B1B15`
- Success: `#34BF49`
- Danger: `#CA0000`
- Dark canvas: `#0A0A0A`
- Dark surface: `#1D1D1D`
- Dark border: `#FFFFFF15`
- Dark text: `#F7F2E8`
- Dark muted text: `#F7F2E8A6`

### Typography
- Font family: Tajawal
- Screen title: 24px, 700, line-height 1.25
- Section title: 18px, 700, line-height 1.3
- Card title: 16px, 600, line-height 1.35
- Body: 15px, 400, line-height 1.6
- Metadata/label: 13px, 500, line-height 1.4
- Button: 15px, 700

### Spacing
- 4px micro
- 8px tight
- 12px small
- 16px base
- 20px section gap
- 24px large
- 32px screen breathing

### Radius
- Inputs/buttons: 16px
- Cards: 18px
- Bottom sheets/dialogs: 24px top corners
- Pills/chips: 999px

### Shadows
- Cards: no heavy shadow; use border and tonal contrast.
- Floating bottom bars: `0 -10px 30px rgba(27,27,27,0.08)`
- Dark mode overlays: `0 -10px 30px rgba(0,0,0,0.35)`

### Icon Style
Use lucide-style 20px or 22px stroke icons, rounded stroke caps, RTL-aware direction for arrows, chevrons, upload/download, and navigation.

### Animation
Use 160-220ms ease-out for sheet open, tab switch, button press, and card reveal. AI running states may use a slow amber progress shimmer. Respect reduced motion.

## Brand Personality

راقي، أنيق، دقيق. The UI must feel trusted, controlled, legal, and efficient. Avoid generic heavy blue legal visuals, cluttered tables, childish illustrations, and excessive decoration.

## Complete Page List

1. [Splash](./01-splash.md)
2. [Onboarding](./02-onboarding.md)
3. [Login](./03-login.md)
4. [Sign Up](./04-signup.md)
5. [Forgot Password](./05-forgot-password.md)
6. [OTP Verification](./06-otp-verification.md)
7. [Home Dashboard](./07-home-dashboard.md)
8. [Cases List](./08-cases-list.md)
9. [Add Case](./09-add-case.md)
10. [Case Details](./10-case-details.md)
11. [AI Workflow Hub](./11-ai-workflow-hub.md)
12. [AI Workflow Runner](./12-ai-workflow-runner.md)
13. [Clients List](./13-clients-list.md)
14. [Client Details](./14-client-details.md)
15. [Agenda](./15-agenda.md)
16. [Documents](./16-documents.md)
17. [Legal Library](./17-legal-library.md)
18. [Legal Contracts](./18-legal-contracts.md)
19. [Process Server Papers](./19-process-server-papers.md)
20. [Chat](./20-chat.md)
21. [Notifications](./21-notifications.md)
22. [Subscription and AI Points](./22-subscription-ai-points.md)
23. [Settings and Profile](./23-settings-profile.md)
24. [System States](./24-system-states.md)

