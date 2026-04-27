'use client';

import { Card, CardBody, Divider } from "@heroui/react";

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen py-20 px-4 bg-[#0A0A0A] [direction:rtl]">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#FBFAE8]">
                        سياسة الاسترداد والإلغاء
                    </h1>
                    <p className="text-[#FBFAE8A6]">
                        منصة محامي سمارت – EGY Legal for Smart Technology
                    </p>
                </div>

                <PolicyCard title="مقدمة">
                    تنظم هذه السياسة قواعد إلغاء الطلبات واسترداد المدفوعات الخاصة بخدمات محامي سمارت، ويعد استخدام المنصة موافقة صريحة عليها.
                </PolicyCard>

                <PolicyCard title="تعريفات أساسية">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>الخدمة: أي خدمة رقمية قانونية يتم تقديمها للمستخدم</li>
                        <li>الطلب: أي طلب يتم إنشاؤه عبر المنصة</li>
                        <li>بدء التنفيذ: الشروع في معالجة الطلب أو مراجعة المستندات</li>
                        <li>مخرجات الخدمة: كل ما يتم تسليمه من مستندات أو ملفات</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="طبيعة الخدمات الرقمية">
                    الخدمات يتم إعدادها خصيصًا لكل مستخدم، ويبدأ تنفيذها فور تأكيد الطلب، لذا تختلف قواعد الاسترداد عن المنتجات المادية.
                </PolicyCard>

                <PolicyCard title="الإلغاء قبل بدء التنفيذ">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>يجوز الإلغاء قبل بدء التنفيذ</li>
                        <li>يتم رد كامل المبلغ بعد خصم رسوم بوابة الدفع</li>
                        <li>بدايه أي عمل فعلي على الطلب</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="الإلغاء بعد بدء التنفيذ">
                    <ul className="list-disc pe-6 space-y-2">
                        <li>لا يحق استرداد المبلغ كاملًا</li>
                        <li>تسليم أي مسودة يُعد تنفيذًا جزئيًا</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="حالات عدم الاسترداد">
                    <ul className="list-disc pe-6 space-y-2">
                        <li><strong>استلام المخرجات النهائية:</strong> بمجرد الانتهاء من توليد التحليلات أو المستندات القانونية وتسليمها عبر حسابك.</li>
                        <li><strong>البيانات المغلوطة أو الناقصة:</strong> في حال تعذر دقة العمل نتيجة رفع مستندات مبهمة أو إدخال بيانات وتفاصيل غير صحيحة من قِبلك.</li>
                        <li><strong>استهلاك موارد النظام:</strong> بمجرد البدء الفعلي في معالجة الطلب وإنجاز أنظمة الذكاء الاصطناعي للجزء الأكبر من الخدمة.</li>
                        <li><strong>انعدام التجاوب:</strong> توقف المستخدم عن تقديم التوضيحات اللازمة لاستكمال العمل لفترة ممتدة دون مبرر واضح.</li>
                    </ul>
                </PolicyCard>

                <PolicyCard title="بدائل الاسترداد">
                    قد تقترح المنصة تعديل الطلب، أو إصدار رصيد استخدام، أو إعادة تسليم نسخة معدلة بدل رد المبلغ.
                </PolicyCard>

                <PolicyCard title="سياسة المراجعات">
                    تشمل التصحيح والتحسين فقط، ولا تشمل تغيير الوقائع أو إضافة معلومات جديدة دون مقابل إضافي.
                </PolicyCard>

                <PolicyCard title="أخطاء الدفع">
                    في حال تكرار خصم نقدي مثبت تقنيًا يتم رد المبلغ الزائد بعد التحقق.
                </PolicyCard>

                <PolicyCard title="مدة وطريقة الاسترداد">
                    تتم عبر نفس وسيلة الدفع قدر الإمكان، وتخضع لسياسات البنوك ومزودي الدفع، ولا تُرد رسوم سداد.
                </PolicyCard>

                <PolicyCard title="طريقة تقديم الطلب">
                    يجب إرسال رقم الطلب وسبب الإلغاء وإثبات الدفع عبر القناة المعتمدة.
                </PolicyCard>

                <PolicyCard title="مكافحة إساءة الاستخدام">
                    تحتفظ المنصة بحق رفض الاسترداد في حالات التحايل أو إساءة الاستخدام.
                </PolicyCard>

                <Divider />

                <PolicyCard title="أحكام عامة">
                    هذه السياسة جزء من شروط الاستخدام ويحق للمنصة تحديثها في أي وقت.
                </PolicyCard>

            </div>
        </div>
    );
};

export default RefundPolicyPage;


function PolicyCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-md  hover:shadow-xl transition-all rounded-2xl bg-[#1b1b1b]">
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