'use client'
import HeadTitle from '../headTitle/HeadTitle';
import Container from '../ui/Container';
import './AboutSection.css'
import { Card, CardBody, Divider } from '@heroui/react';

const AboutSection = () => {
    return (
        <section id="about-section" className="about-section py-40">
            <Container>
                <div className="max-w-6xl mx-auto space-y-16">

                    {/* Hero */}
                    <div className="text-center space-y-6">
                        <HeadTitle
                            title='من نحن'
                            span='محامي سمارت'
                            desc='محامي سمارت منصة قانونية رقمية طورتها شركة قانوني للتكنولوجيه الذكيه
                            – EGY Legal for Smart Technology، لتقديم تجربة قانونية حديثة
                            تجمع بين الخبرة القانونية والتقنيات الذكية.'
                            position='center'
                        />
                    </div>

                    {/* ريادتنا + رسالتنا + رؤيتنا */}
                    <div className="grid md:grid-cols-3 gap-6">

                        <InfoCard title="ريادتنا">
                            نقدم أنفسنا كأول منصة بالذكاء الاصطناعي موجهة للمحامين عربيًا وعالميًا،
                            للإنجاز الأعمال القانونية بصورة أسرع وأكثر وضوحًا.
                        </InfoCard>

                        <InfoCard title="رسالتنا">
                            تقديم تجربة قانونية رقمية أكثر وضوحًا وسرعة،
                            تقلل من العشوائية وسوء الفهم، مع الحفاظ على السرية والمهنية.
                        </InfoCard>

                        <InfoCard title="رؤيتنا">
                            أن نكون البوابة الأولى للأعمال القانونية الذكية في المنطقة،
                            عبر أدوات ترفع كفاءة إدارة القضايا والعقود.
                        </InfoCard>

                    </div>

                    <Divider />

                    {/* ماذا نقدم */}
                    <SectionCard title="ماذا نقدم">
                        <ul className="list-disc pe-6 space-y-3">
                            <li>صياغة وإعداد مستندات قانونية متنوعة وفق النطاق المطلوب .</li>
                            <li>تنظيم وتحليل الملفات القانونية واستخراج النقاط الجوهرية.</li>
                            <li>دعم اتخاذ القرار القانوني بصورة مبسطة دون ضمان نتيجة قضائية.</li>

                        </ul>
                    </SectionCard>

                    {/* كيف نعمل */}
                    <SectionCard title="كيف نعمل">
                        <ul className="list-disc pe-6 space-y-3">
                            <li>يقوم المستخدم بتغذيه الويب سايت بالوقائع والمستندات.</li>
                            <li>يتم إعداد المحتوى بناءً على البيانات المقدمة فقط.</li>
                            <li>يتم التنبيه عند وجود مستندات غير واضحة أو ناقصة.</li>
                            <li>يتم تسليم العمل بصياغة مرتبة وقابلة للمراجعة.</li>
                        </ul>
                    </SectionCard>

                    {/* ما يميزنا */}
                    <SectionCard title="ما يميزنا">
                        <ul className="list-disc pe-6 space-y-3">
                            <li><strong>السرية:</strong> حماية بيانات المستخدم.</li>
                            <li><strong>الدقة:</strong> صياغة منضبطة تعتمد على الوقائع.</li>
                            <li><strong>الوضوح:</strong> تبسيط التعقيد القانوني.</li>

                        </ul>
                    </SectionCard>

                    {/* حدود الخدمة */}
                    <SectionCard title="حدود الخدمة ومسؤولية الاستخدام">
                        <ul className="list-disc pe-6 space-y-3">
                            <li>تعتمد الخدمة على دقة البيانات المقدمة من المستخدم.</li>
                            <li>لا نضمن نتيجة قضائية أو قرارًا إداريًا.</li>
                            <li>المستخدم مسؤول عن مراجعة المخرجات قبل أي إجراء رسمي.</li>
                        </ul>
                    </SectionCard>

                </div>
            </Container>
        </section>
    );
};

export default AboutSection;





function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="card shadow-md hover:shadow-xl transition-all rounded-2xl">
            <CardBody className=" card space-y-4 p-6">
                <h3 className="text-2xl font-semibold ">{title}</h3>
                <p className=" leading-relaxed text-base md:text-lg">
                    {children}
                </p>
            </CardBody>
        </Card>
    );
}

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="card-list shadow-md rounded-2xl card">
            <CardBody className="space-y-5 p-8">
                <h3 className="text-3xl font-semibold ps-4">
                    {title}
                </h3>
                <div className="leading-relaxed text-base md:text-lg">
                    {children}
                </div>
            </CardBody>
        </Card>
    );
}