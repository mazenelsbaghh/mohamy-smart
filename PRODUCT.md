# Product

## Register

product

## Users
**Admin users** manage the platform — monitoring lawyers, reviewing subscriptions, handling contact requests, and tracking performance metrics. They open the dashboard for operational oversight.

**Lawyer users** run their daily practice — checking cases, documents, calendar, and client requests. They open their dashboard to get work done efficiently.

Both audiences carry equal weight. Neither is secondary. Design decisions must serve the operational admin and the practicing lawyer with the same level of polish and care.

**Context:** Arabic-speaking legal professionals in the Gulf/MENA region. The platform is used on both desktop and mobile. Lawyers may check it on the go; admins are more likely desktop-first but mobile cannot be neglected.

## Product Purpose
Mohamy Smart is a premium legal-tech platform tailored for lawyers and administrators in the Gulf/MENA region. It manages cases, documents, calendars, client requests, subscriptions, and AI-assisted workflows (like drafting defense memos or reviewing regulations) to streamline daily legal practices and platform operations.

## Brand Personality
**Three words:** راقي، أنيق، دقيق — Refined, Elegant, Precise

- **Refined**: Nothing excessive. Every element earns its place. The interface reflects the seriousness and status of legal work.
- **Elegant**: Visual harmony over visual noise. Generous whitespace, smooth transitions, considered typography with Tajawal across all weights.
- **Precise**: Details matter. Alignment, spacing, and contrast are non-negotiable. The interface communicates competence through exactness.

**Voice:** Professional without being cold. The interface speaks clearly and doesn't over-explain.

**Emotional goal:** Users should feel *in control* and *trusted*. The platform should inspire confidence — not anxiety — when handling high-stakes legal work.

## Anti-references
Avoid generic legal platform aesthetics (heavy blues, cluttered tables, serif fonts, low contrast). Avoid the sterile enterprise SaaS look. Avoid anything that reads as "a template."

## Design Principles
1. **Precision over decoration** — Every visual choice (color, shadow, radius, spacing) must have a purpose. Ornament that doesn't communicate something should be removed.
2. **Both audiences, same quality** — Admin and lawyer interfaces must feel equally polished. There is no "secondary" screen. A feature is not done until both user contexts feel right.
3. **RTL-native, not RTL-adapted** — The layout, animations, icon direction, and information flow are designed in Arabic first. RTL is not an afterthought applied at the end.
4. **Dark mode parity** — Every component, every state, every page must look as considered in dark mode as in light. Test both. Ship both.
5. **Mobile is a first-class context** — Lawyers use this on phones. The mobile experience must be as frictionless and polished as desktop, not a compressed version of it.

## Accessibility & Inclusion
- **WCAG AA** minimum — contrast ratios and keyboard navigation required on all interactive elements
- **Dark mode** — equal quality to light mode, not a color inversion
- **Mobile-first priority** — breakpoints: 550px / 1000px / 1100px / 1600px
- **Reduced motion** — animations should respect `prefers-reduced-motion`
