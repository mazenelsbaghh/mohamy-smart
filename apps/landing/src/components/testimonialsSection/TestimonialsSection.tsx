'use client';
import './TestimonialsSection.css';
import Container from '../ui/Container';
import HeadTitle from '../headTitle/HeadTitle';

import { useSyncExternalStore } from 'react';
import { Testimonial, TestimonialCarousel } from '../ui/TestimonialCarousel';

const TestimonialsSection = () => {
    const reduceMotion = useSyncExternalStore(
        (callback) => {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', callback);
            return () => mediaQuery.removeEventListener('change', callback);
        },
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        () => false
    );

    // Respect user's motion preferences — disable continuous autoplay if reduced motion is preferred
    const swiperSpeed = reduceMotion ? 500 : 5000;

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "م. محمود حسن",
            role: "مدير مكتب قانوني",
            rating: 5,
            text: "بصفتي محامي ممارس منذ أكثر من عشر سنوات، تعاملت مع العديد من الأنظمة والمنصات القانونية، لكن تجربة محامي سمارت كانت مختلفة تمامًا. المنصة سهلة الاستخدام بشكل مدهش."
        },
        {
            id: 2,
            name: "أ. سارة محمد",
            role: "محامية متدربة",
            rating: 3,
            text: "التطبيق ساعدني أوفر وقت كتير في البحث عن النصوص القانونية. بجد بيخلي الشغل أسرع وأسهل."
        },
        {
            id: 3,
            name: "د. أحمد عبد الله",
            role: "أستاذ قانون",
            rating: 4,
            text: "واجهة المستخدم بسيطة وعملية. محتاجين بس بعض الإضافات الصغيرة، لكن بشكل عام ممتاز."
        },
        {
            id: 4,
            name: "أ. ليلى محمود",
            role: "محامية شركات",
            rating: 5,
            text: "قدرت أتعامل مع قضايا معقدة بشكل أسرع بفضل الذكاء الاصطناعي في المنصة. بصراحة طفرة في المجال."
        },
        {
            id: 5,
            name: "م. كريم فؤاد",
            role: "مستشار قانوني",
            rating: 5,
            text: "الدعم الفني سريع جدًا ومتجاوب. حسيت إني مش لوحدي وأنا بستخدم النظام."
        },
        {
            id: 6,
            name: "أ. ندى يوسف",
            role: "محامية جنائية",
            rating: 4,
            text: "الخدمة قوية وساعدتني في تنظيم شغلي، خصوصًا مع ضغط القضايا. أتمنى بس تحسين السرعة أكتر."
        },
        {
            id: 7,
            name: "أ. محمد سعيد",
            role: "محامي عقود",
            rating: 5,
            text: "فكرة ذكية جدًا، خلتني أقدر أركز في شغلي بدل ما أضيع وقت في الأوراق والتفاصيل المتكررة."
        },
        {
            id: 8,
            name: "أ. ياسمين علي",
            role: "محامية أحوال شخصية",
            rating: 5,
            text: "منصة سهلة وبسيطة حتى للعملاء اللي معندهمش خلفية تقنية. فعلاً بتفرق في التعامل."
        }
    ];

    const firstHalf = testimonials.slice(0, Math.ceil(testimonials.length / 2));
    const secondHalf = testimonials.slice(Math.ceil(testimonials.length / 2));

    return (
        <section id='testimonials-section' className='testimonials-section py-40'>
            <Container>
                <HeadTitle
                    title='آراء عملائنا'
                    desc='تعرف على تجارب المحامين الذين يستخدمون منصتنا'
                    position='center'
                />

                <div className="flex mt-32">
                    <TestimonialCarousel
                        testimonials={firstHalf}
                        reduceMotion={reduceMotion}
                        speed={swiperSpeed}
                        reverseDirection={true}
                        ariaLabel="آراء العملاء - الصف الأول"
                    />
                </div>
                <div className="flex">
                    <TestimonialCarousel
                        testimonials={secondHalf}
                        reduceMotion={reduceMotion}
                        speed={swiperSpeed}
                        reverseDirection={false}
                        ariaLabel="آراء العملاء - الصف الثاني"
                    />
                </div>
            </Container>
        </section>
    );
};

export default TestimonialsSection;
