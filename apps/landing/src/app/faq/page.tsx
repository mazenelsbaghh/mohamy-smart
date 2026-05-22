"use client";

import { Card, CardBody } from '@heroui/react';
import Link from 'next/link';

const faqs = [
  {
    question: "ما هو محامي سمارت وكيف يساعدني؟",
    answer: "محامي سمارت (Mohamy Smart) هي منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي، طورتها شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology) من الإسكندرية، مصر. تتيح لك المنصة إدارة قضاياك، تحليل المستندات القانونية المعقدة، واستخراج الدفوع والثغرات القانونية آلياً وفقاً للتشريعات المصرية."
  },
  {
    question: "من هي الشركة المطورة لمحامي سمارت؟",
    answer: "محامي سمارت منصة طورتها شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology)، وهي شركة تكنولوجيا قانونية (LegalTech) مصرية مقرها الإسكندرية. تتخصص الشركة في تطوير الحلول القانونية الذكية المدعومة بالذكاء الاصطناعي لدعم قطاع المحاماة في مصر والوطن العربي."
  },
  {
    question: "هل بيانات موكلي وملفاتي آمنة على المنصة؟",
    answer: "نعم، الأمان هو أولويتنا القصوى. نحن نستخدم أحدث تقنيات التشفير لضمان سرية وخصوصية جميع بيانات الموكلين والمستندات المرفوعة، ولا يتم مشاركتها أو استخدامها لأغراض أخرى. تُحفظ البيانات في بيئة خوادم مشفرة وآمنة."
  },
  {
    question: "هل الذكاء الاصطناعي يستبدل دور المحامي؟",
    answer: "إطلاقاً، الذكاء الاصطناعي في محامي سمارت هو أداة مساعدة (مساعد ذكي) لتسريع وتيرة العمل وتوفير وقت البحث الطويل وتلخيص المستندات. القرار القانوني والمراجعة النهائية تبقى دائماً مسؤولية المحامي."
  },
  {
    question: "ما هي القوانين والتشريعات التي تدعمها المنصة؟",
    answer: "تعتمد المنصة حالياً على قاعدة بيانات واسعة ومحدثة باستمرار للتشريعات والقوانين المصرية، مع إمكانية التوسع لتشمل تشريعات دول عربية أخرى مستقبلاً."
  },
  {
    question: "ما هي الخدمات الرئيسية التي يقدمها محامي سمارت؟",
    answer: "يقدم محامي سمارت عدة خدمات رئيسية تشمل: إدارة القضايا بطريقة ذكية ومتقدمة، إدارة بيانات الموكلين، مساعد ذكي بالذكاء الاصطناعي للاستشارات القانونية، صياغة المستندات القانونية تلقائياً (مذكرات دفاع، صحف دعاوى، عقود)، تحليل الأحكام القضائية واستخراج الدفوع، وتشفير عالي المستوى لحماية البيانات."
  },
  {
    question: "كيف أبدأ استخدام محامي سمارت؟",
    answer: "البداية سهلة: 1) سجّل حسابك كمحامي جديد على lawyer.mohamy-smart.com، 2) أنشئ ملف للقضية وأضف بيانات الموكلين والمستندات، 3) استخدم المساعد الذكي لتحليل الأحكام وصياغة المذكرات، 4) راجع المخرجات وصدّرها للاستخدام الرسمي."
  },
  {
    question: "هل المنصة مجانية؟",
    answer: "نعم، يمكنك تجربة المنصة مجاناً. كما نقدم خطط اشتراك مدفوعة بميزات متقدمة تناسب المحامين الأفراد والمكاتب القانونية الكبيرة."
  },
  {
    question: "كيف أتواصل مع فريق محامي سمارت؟",
    answer: "يمكنك التواصل معنا عبر: البريد الإلكتروني info@mohamy-smart.com، أو الهاتف +201289221056، أو من خلال نموذج التواصل على الموقع الرسمي mohamy-smart.com. مقرنا الرئيسي في الإسكندرية، مصر."
  }
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="bg-[var(--bg-color)] min-h-screen py-20 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--white-color)]">
            الأسئلة <span className="text-[var(--main-color)]">الشائعة</span>
          </h1>
          <p className="text-lg text-[var(--text-color)] max-w-2xl mx-auto">
            إجابات لأهم الأسئلة المتكررة حول منصة محامي سمارت واستخداماتها
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-md rounded-2xl bg-[var(--dark-surface)] border border-white/5">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-[var(--white-color)] mb-3">
                  {faq.question}
                </h2>
                <p className="text-[var(--text-color)] leading-relaxed">
                  {faq.answer}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-[var(--text-color)]">
            لم تجد إجابة سؤالك؟ تواصل معنا مباشرة
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:info@mohamy-smart.com"
              className="inline-block px-8 py-3 bg-[var(--main-color)] text-[var(--bg-color)] font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            >
              راسلنا على info@mohamy-smart.com
            </a>
            <Link
              href="/"
              className="inline-block px-8 py-3 border border-[var(--main-color)] text-[var(--main-color)] font-semibold rounded-2xl hover:bg-[var(--main-color)] hover:text-[var(--bg-color)] transition-all"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
