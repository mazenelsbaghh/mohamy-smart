'use client';
import { Accordion, AccordionItem } from '@heroui/react';
import Container from '../ui/Container';
import HeadTitle from '../headTitle/HeadTitle';
import './FaqSection.css';

const FaqSection = () => {
    const faqs = [
        {
            question: "ما هو محامي سمارت وكيف يساعدني؟",
            answer: "محامي سمارت هي منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي، تتيح لك إدارة قضاياك، تحليل المستندات القانونية المعقدة، واستخراج الدفوع والثغرات القانونية آلياً وفقاً للتشريعات."
        },
        {
            question: "هل بيانات موكلي وملفاتي آمنة على المنصة؟",
            answer: "نعم، الأمان هو أولويتنا القصوى. نحن نستخدم أحدث تقنيات التشفير لضمان سرية وخصوصية جميع بيانات الموكلين والمستندات المرفوعة، ولا يتم مشاركتها أو استخدامها لأغراض أخرى."
        },
        {
            question: "هل الذكاء الاصطناعي يستبدل دور المحامي؟",
            answer: "إطلاقاً، الذكاء الاصطناعي هو أداة مساعدة (مساعد ذكي) لتسريع وتيرة العمل وتوفير وقت البحث الطويل وتلخيص المستندات. القرار القانوني والمراجعة النهائية تبقى دائماً مسؤولية المحامي."
        },
        {
            question: "ما هي القوانين والتشريعات التي تدعمها المنصة؟",
            answer: "تعتمد المنصة حالياً على قاعدة بيانات واسعة ومحدثة باستمرار للتشريعات والقوانين المصرية، مع إمكانية التوسع لتشمل تشريعات دول أخرى مستقبلاً."
        }
    ];

    // FAQPage Structured Data (JSON-LD) specifically for GEO & SEO
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
        <section id="faq-section" className="faq-section py-32 bg-[var(--dark-surface)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Container>
                <div className="max-w-4xl mx-auto">
                    <HeadTitle
                        title='الأسئلة'
                        span='الشائعة'
                        desc='إجابات لأهم الأسئلة المتكررة حول منصة محامي سمارت واستخداماتها.'
                        position='center'
                    />
                    
                    <div className="mt-16">
                        <Accordion variant="splitted" className="faq-accordion">
                            {faqs.map((faq, index) => (
                                <AccordionItem 
                                    key={index} 
                                    aria-label={faq.question} 
                                    title={<span className="text-xl font-semibold text-[var(--white-color)]">{faq.question}</span>}
                                    className="mb-4 bg-[var(--bg-color)] border border-white/5"
                                >
                                    <p className="text-base text-[var(--text-color)] leading-relaxed pb-4">
                                        {faq.answer}
                                    </p>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default FaqSection;
