# AI Chat — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
محادثة مع الذكاء الاصطناعي للاستشارات القانونية السريعة. على الموبايل هذه الشاشة مألوفة — تشبه WhatsApp/iMessage. المحامي يسأل سؤال قانوني ويحصل على إجابة. UX مألوف = adoption أسرع.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`. Header "المحادثة الذكية" + أيقونة 🤖 + أيقونة menu (⋮) → "محادثة جديدة" / "مسح المحادثة".

**Empty State** (أول استخدام):
- أيقونة AI كبيرة 64px centered (دائرة `#FBFAE8` + أيقونة ⚡ `#EF950A`)
- "مرحبًا! أنا مساعدك القانوني الذكي" Bold 18px centered
- "اسألني أي سؤال قانوني وسأساعدك" Regular 14px `#1B1B1BA6`
- **Suggested Prompts**: 3 بطاقات أفقية scrollable:
  - "ما هي خطوات رفع دعوى مدنية؟"
  - "اشرح لي الفرق بين الطعن والاستئناف"
  - "ما هي شروط صحيفة الدعوى؟"
  كل بطاقة: خلفية `#FFFFFF` / `#1D1D1D` + حدود `#EF950A20` + radius `12px` + padding `12px` + Regular 13px

**Chat Messages Area** (scrollable, flex-grow):
- **رسالة المستخدم** (يمين — RTL): فقاعة بخلفية `#EF950A` + نص أبيض Regular 14px + radius `16px 16px 0 16px` + وقت `10px` أسفل يسار الفقاعة
- **رسالة AI** (يسار): فقاعة بخلفية `#FFFFFF` / `#1D1D1D` + نص `#1B1B1B` Regular 14px + radius `16px 16px 16px 0` + أيقونة 🤖 صغيرة 20px بجوار الفقاعة
- **AI Typing**: 3 نقاط متحركة (bounce animation) داخل فقاعة AI فارغة
- الرسائل تظهر بتأثير slide-up خفيف

**Input Bar** (ثابت أسفل — فوق safe area):
- خلفية `#FFFFFF` / `#1D1D1D` مع ظل علوي
- حقل إدخال: خلفية `#F0EEE7` / `#2A2A2A`, radius `full`, ارتفاع 44px, padding 16px
- Placeholder: "اكتب سؤالك القانوني..."
- زر إرسال: دائرة 36px `#EF950A` مع أيقونة إرسال (→ rotated for RTL ←) أبيضاء — على يسار الحقل
- زر الإرسال disabled (opacity 0.4) عندما الحقل فارغ

## Content Blocks (Arabic copy)
- Title: "المحادثة الذكية"
- Empty: "مرحبًا! أنا مساعدك القانوني الذكي"
- Empty sub: "اسألني أي سؤال قانوني وسأساعدك"
- Suggestions: "ما هي خطوات رفع دعوى مدنية؟" / "اشرح لي الفرق بين الطعن والاستئناف" / "ما هي شروط صحيفة الدعوى؟"
- Input placeholder: "اكتب سؤالك القانوني..."
- Menu: "محادثة جديدة" / "مسح المحادثة"

## Components Used
- Chat Header with AI icon
- Empty state with suggestions carousel
- User message bubble (right)
- AI message bubble (left) with avatar
- Typing indicator (3 dots)
- Sticky input bar with send button
- Suggestion chips (scrollable)

## Interaction Notes
- Send on return key or send button
- Suggestion chip tap → sends as message
- AI response streams word-by-word (typing effect)
- Long press on message → copy
- Messages auto-scroll to bottom on new message
- Keyboard pushes input bar up
- Pull-down → older messages (if any)

## States to Design
| State | Description |
|-------|-------------|
| empty | Welcome message + suggestions |
| chatting | User + AI messages |
| ai-typing | Typing indicator visible |
| error | "حدث خطأ — حاول مجدداً" with retry |

## Linked Screens
- **Navigates from**: Home (quick action or nav) / "المزيد" tab
- **Navigates to**: Self-contained (stays in chat)

## Design Tokens Reference
```
User bubble: #EF950A
AI bubble: #FFFFFF / #1D1D1D
AI avatar: 🤖 in #FBFAE8 circle
Input bg: #F0EEE7 / #2A2A2A
Send button: #EF950A
Send disabled: #EF950A at 40% opacity
Suggestion card border: #EF950A20
```
