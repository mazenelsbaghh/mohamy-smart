# Home Dashboard — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Daily command center for the lawyer. Shows urgent next actions, today sessions, active cases, AI points, and quick actions.

## Visual Prompt
Design a premium RTL mobile dashboard with a top header containing greeting on the right, notification icon on the left, and a compact AI points pill under or beside the greeting. The first card is "الإجراء التالي" with the most urgent session/case action and one amber CTA. Then show a horizontal row of quick action chips: "إضافة قضية"، "رفع مستند"، "بدء مذكرة". Below, show stacked sections for "جلسات اليوم", "القضايا النشطة", and "آخر أعمال الذكاء الاصطناعي". Use cards on `#F0EEE7` canvas, with `#FFFEFA` surfaces, 18px radius, subtle borders, and small amber highlights only for actions and active indicators. Bottom navigation remains fixed with five tabs.

## Content Blocks (Arabic copy)
- صباح الخير، أستاذ مازن
- رصيد الذكاء الاصطناعي
- الإجراء التالي
- جلسة اليوم الساعة ١١:٣٠
- افتح القضية
- إضافة قضية
- رفع مستند
- بدء مذكرة
- جلسات اليوم
- القضايا النشطة
- آخر أعمال الذكاء الاصطناعي
- لا توجد جلسات اليوم

## Components Used
- App header
- AI points pill
- Action card
- Quick action chips
- Case/session cards
- Bottom navigation

## Interaction Notes
Quick actions deep-link to Add Case, Documents upload, or AI Workflow Hub. Notification icon opens Notifications.

## States to Design
| State | Description |
|-------|-------------|
| normal | Data-rich dashboard |
| empty | No sessions/cases with add actions |
| loading | Skeleton cards |
| partial | Some sections show empty state |

## Linked Screens
- **Navigates from**: Login, Splash
- **Navigates to**: Cases, Agenda, Documents, AI Workflow Hub, Notifications, Subscription

## Design Tokens Reference
Canvas `#F0EEE7`, card `#FFFEFA`, accent `#EF950A`, bottom nav height 72px.

