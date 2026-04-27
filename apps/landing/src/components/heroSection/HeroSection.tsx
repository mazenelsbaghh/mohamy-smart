'use client';
import './HeroSection.css';
import Image from 'next/image';
import Container from '../ui/Container';

import { Chip } from '@heroui/react';

import { IoArrowBackOutline } from 'react-icons/io5';

import dashboard from '../../../public/images/dashboard.png';

import { motion, useScroll, useTransform, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, y: 0, 
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Custom easing for premium feel
    }
};

const HeroSection = () => {
    const { scrollY } = useScroll();
    // Move the image slightly down as user scrolls down for a subtle parallax effect
    const imageY = useTransform(scrollY, [0, 800], [0, 120]);
    const imageOpacity = useTransform(scrollY, [0, 600], [1, 0.8]);

    return (
        <section id='hero-section' className='hero-section py-40 relative flex items-center min-h-[100vh]' aria-label="القسم الرئيسي">
            <span className='shadow' aria-hidden="true"></span>
            <span className='shadow' aria-hidden="true"></span>
            <Container>
                <motion.div 
                    className="text-box"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Chip className='py-4 px-8 bg-[#1B1B1B]' color="warning" variant="bordered">
                            سمارت محامي
                        </Chip>
                    </motion.div>
                    <motion.h1 variants={itemVariants}>
                        <span>المحاماة برؤية عصرية…</span>
                        والمستقبل تحت سيطرتك
                    </motion.h1>
                    <motion.p variants={itemVariants}>
                        منصة قانونية متكاملة تدعم المحامين والمكاتب القانونية بأحدث تقنيات الذكاء الاصطناعي، لإدارة القضايا والاستشارات بكفاءة واحترافية، كل ذلك في مكان واحد آمن وسهل الاستخدام
                    </motion.p>

                    <motion.div className='hero-btns' variants={itemVariants}>
                        <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078'}/auth/sign-up`} className='main-btn'>
                            سجل معانا
                            <IoArrowBackOutline aria-hidden="true" />
                        </a>
                        <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078'}/auth/login`} className='login-btn-hero'>
                            تسجيل الدخول
                        </a>
                    </motion.div>
                </motion.div>
            </Container>
            <div className="image-box">
                <motion.div className="frame"
                    style={{ y: imageY, opacity: imageOpacity }}
                    initial={{ rotateX: -20, scale: 0.9, y: 100 }}
                    animate={{ rotateX: -10, scale: 1, y: 0 }}
                    whileHover={{ 
                        rotateX: 0, 
                        scale: 1.15,
                        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
                    }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    <Image src={dashboard} alt='واجهة لوحة تحكم منصة محامي سمارت لإدارة القضايا' priority />
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;