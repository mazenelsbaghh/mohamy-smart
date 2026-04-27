'use client';
import { useRef } from 'react';
import './HowToUseSection.css';
import HeadTitle from '../headTitle/HeadTitle';
import Container from '../ui/Container';

import Image from 'next/image';
import vector from '../../../public/images/Vector.png';
import lawyer_1 from '../../../public/images/Lawyer_1.png';
import lawyer_2 from '../../../public/images/Lawyer_2.png';

import { motion, useScroll, useTransform, Variants } from "framer-motion";

const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.25,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: 40 }, // Slides in from the right (RTL direction)
    visible: { 
        opacity: 1, x: 0, 
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
};

const HowToUseSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Subtle parallax for images
    const lawyer1Y = useTransform(scrollYProgress, [0, 1], [30, -50]);
    const lawyer2Y = useTransform(scrollYProgress, [0, 1], [-30, 50]);

    return (
        <section ref={sectionRef} id='how-to-use-section' className='how-to-use-section py-40 relative' style={{ position: "relative" }}>
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <HeadTitle
                        title='كيف تستخدم'
                        span='محامي سمارت'
                        position='center'
                    />
                </motion.div>
                <div className="flex flex-wrap mt-32">

                    <motion.div 
                        className="w-full md:w-5/12 "
                        variants={listVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <ul className="relative">
                            <motion.li variants={itemVariants}>
                                <h5>سجّل حسابك</h5>
                                <p>انضم كمسجل جديد للوصول إلى لوحة تحكم محامي سمارت، لإدارة مكتبك القانوني بالكامل.</p>
                            </motion.li>
                            <motion.li variants={itemVariants}>
                                <h5>أنشئ قضيتك وأضف المستندات</h5>
                                <p>قم بفتح ملف للقضية، وأضف بيانات الموكلين، ثم ارفع المستندات والأحكام الخاصة بها.</p>
                            </motion.li>
                            <motion.li variants={itemVariants}>
                                <h5>حلّل وصِغ بالذكاء الاصطناعي</h5>
                                <p>استخدم مسارات العمل الذكية لتحليل الأحكام، واستخراج الدفوع، وصياغة صحف الدعاوى والمذكرات.</p>
                            </motion.li>
                            <motion.li variants={itemVariants}>
                                <h5>احفظ مستنداتك واستخدمها</h5>
                                <p>راجع المخرجات القانونية واعتمدها، ثم قم بتصديرها أو طباعتها جاهزة للاستخدام الرسمي.</p>
                            </motion.li>
                        </ul>
                    </motion.div>

                    <div className="hidden md:block md:w-7/12 ">
                        <div className="images">
                            <div className="vector">
                                <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [-20, 20]) }}>
                                    <Image src={vector} alt='vector image' />
                                </motion.div>
                            </div>
                            <motion.div className="image" style={{ y: lawyer1Y }}>
                                <Image src={lawyer_1} alt='lawyer image' />
                            </motion.div>
                            <motion.div className="image" style={{ y: lawyer2Y }}>
                                <Image src={lawyer_2} alt='lawyer image' />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default HowToUseSection;