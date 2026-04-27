# Notifications — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة الإشعارات — جديدة في الموبايل (غير موجودة حالياً في الويب). تجمع كل التنبيهات: مواعيد قريبة، اكتمال تحليل AI، اقتراب انتهاء الاشتراك، تحديثات القضايا.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header "الإشعارات" Bold 22px + "مسح الكل" بلون `#EF950A` Bold 13px على اليسار.

**Filter Tabs** (أعلى): scrollable horizontal:
- "الكل" (active) / "الجلسات" / "التحليلات" / "النظام"
- نفس chip style من Cases List

**Notifications List**: مجمعة بالتاريخ:
- **Divider**: "اليوم" / "أمس" / "هذا الأسبوع" — Regular 12px `#1B1B1BA6` مع خط فاصل

كل إشعار:
- خلفية `#FFFFFF` / `#1D1D1D` (مقروء) أو `#FBFAE8` / `#1D1D1D` مع ظل بسيط (غير مقروء)
- Radius `0` (full-width items, no card separation)
- على اليمين: دائرة أيقونة 40px
  - ⚖️ دائرة برتقالية → جلسة قريبة
  - ⚡ دائرة خضراء → تحليل مكتمل
  - ⏰ دائرة حمراء → تنبيه عاجل
  - 💳 دائرة بنفسجية → اشتراك
- وسط: عنوان Bold 14px + وصف Regular 12px `#1B1B1BA6` + وقت Regular 10px `#1B1B1B40`
- نقطة زرقاء صغيرة 6px على أقصى اليسار (إذا غير مقروء)

**Empty State**: أيقونة جرس بخط مقطع 48px + "لا توجد إشعارات" + Regular 14px `#1B1B1BA6`

## Content Blocks (Arabic copy)
- Title: "الإشعارات"
- Clear: "مسح الكل"
- Tabs: "الكل" / "الجلسات" / "التحليلات" / "النظام"
- Date groups: "اليوم" / "أمس" / "هذا الأسبوع"
- Session notification: "لديك جلسة غداً — قضية {name}"
- AI notification: "اكتمل تحليل مذكرة الدفاع — قضية {name}"
- Subscription: "اشتراكك ينتهي خلال 3 أيام"
- Empty: "لا توجد إشعارات"

## Components Used
- Header with clear action
- Filter chips
- Date group dividers
- Notification items (full-width)
- Category icons in circles
- Unread dot indicator
- Empty state

## Interaction Notes
- Tap notification → navigate to relevant screen (Case Details / Agenda / Subscription)
- Swipe left → delete single notification
- "مسح الكل" → confirmation alert
- Pull-to-refresh
- Mark as read on tap

## States to Design
| State | Description |
|-------|-------------|
| normal | Mix of read and unread notifications |
| empty | No notifications illustration |
| filtered | Only specific category shown |

## Linked Screens
- **Navigates from**: Home (bell icon)
- **Navigates to**: Case Details / Agenda / Subscription (based on notification type)

## Design Tokens Reference
```
Unread bg: #FBFAE8 / slight elevation
Read bg: #FFFFFF / #1D1D1D
Session icon: #EF950A
AI icon: #34BF49
Alert icon: #CA0000
Subscription icon: #8B5CF6
Unread dot: #3B82F6
Time text: #1B1B1B40
```
