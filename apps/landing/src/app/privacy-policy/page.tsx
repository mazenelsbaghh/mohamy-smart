'use client';

import { Card, CardBody, Divider } from '@heroui/react';

const PrivacyPolicyPage = () => {
    return (
        <div className="bg-[#0A0A0A] [direction:rtl] min-h-screen py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#FBFAE8]">
                        سياسة الخصوصية
                    </h1>
                    <p className="text-[#FBFAE8A6]">
                        منصة محامي سمارت – EGY Legal for Smart Technology
                    </p>
                </div>

                <PolicyCard title="مقدمة">
                    تلتزم منصة محامي سمارت بحماية خصوصية المستخدمين والحفاظ على سرية البيانات
                    والمستندات القانونية، وتوضح هذه السياسة كيفية جمع البيانات واستخدامها وحمايتها.
                </PolicyCard>

                <PolicyCard title="نطاق التطبيق">
                    تنطبق هذه السياسة على جميع زوار الموقع والمستخدمين والعملاء وكل وسائل التواصل المرتبطة بالمنصة.
                </PolicyCard>

                <PolicyCard title="البيانات التي نجمعها">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>الاسم والبريد الإلكتروني ورقم الهاتف</li>
                        <li>تفاصيل الطلبات والرسائل</li>
                        <li>المستندات والملفات المرفوعة</li>
                        <li>بيانات الدفع (بدون تخزين بيانات البطاقة)</li>
                        <li>البيانات التقنية وملفات Cookies</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="كيفية استخدام البيانات">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>تنفيذ الخدمات وإدارة الحسابات</li>
                        <li>التواصل والدعم الفني</li>
                        <li>تحسين الأداء وتجربة المستخدم</li>
                        <li>الحماية القانونية والأمنية</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="سرية البيانات">
                    تلتزم منصة محامي سمارت بسرية تامة لجميع المستندات والبيانات القانونية المرفوعة. تُحفظ هذه البيانات في بيئة خوادم مشفرة وآمنة، ولا يتم الاطلاع عليها أو استخدامها لأي أغراض خارج إطار تحليلات الذكاء الاصطناعي التي يطلبها المحامي في قضاياه.
                </PolicyCard>

                <PolicyCard title="مشاركة البيانات">
                    لا يتم بيع البيانات الشخصية، ويتم مشاركتها فقط مع مزودي الاستضافة، الدفع،
                    أو الجهات القانونية عند الضرورة.
                </PolicyCard>

                <PolicyCard title="أمن المعلومات">
                    نطبق إجراءات تقنية وتنظيمية لحماية البيانات مع الإقرار بعدم وجود أمان رقمي مطلق.
                </PolicyCard>

                <PolicyCard title="حقوق المستخدم">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>الوصول لبياناتك</li>
                        <li>تصحيح أو حذف البيانات</li>
                        <li>تقييد أو الاعتراض على المعالجة</li>

                    </ul>
                </PolicyCard>

                <Divider />

                <PolicyCard title="بيان عن المنصة">
                    محامي سمارت منصة قانونية ذكية تخدم المحامين عربيًا وعالميًا باستخدام أحدث التقنيات.
                </PolicyCard>

            </div>
        </div>
    )
};

export default PrivacyPolicyPage;


function PolicyCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-[#1b1b1b]">
            <CardBody className="space-y-4 p-6 md:p-8 text-start">
                <h2 className="text-xl md:text-2xl font-semibold text-[#FBFAE8]">
                    {title}
                </h2>
                <div className="text-[#FBFAE8A6] leading-relaxed text-sm md:text-base">
                    {children}
                </div>
            </CardBody>
        </Card>
    );
}