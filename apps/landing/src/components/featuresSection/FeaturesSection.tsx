'use client';
import './FeaturesSection.css';

import Container from '../ui/Container';
import HeadTitle from '../headTitle/HeadTitle';
import FeatureCard from '../ui/FeatureCard';

import folder_ from '../../../public/images/folder_.png';
import people_1 from '../../../public/images/people_1.png';
import brain_ from '../../../public/images/brain_.png';
import legal_document_ from '../../../public/images/legal-document_.png';
import shield_ from '../../../public/images/shield_.png';
import barometer_ from '../../../public/images/barometer_.png';


// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import required modules
import { Pagination } from 'swiper/modules';

import { motion, Variants } from "framer-motion";

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

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, y: 0, 
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
};

const FeaturesSection = () => {
    const features = [
        { title: "إدارة القضايا", desc: "نظم جميع قضاياك بطريقة ذكية ومتقدمة", icon: folder_ },
        { title: "إدارة الموكلين", desc: "احفظ سجلات شاملة لجميع عملائك", icon: people_1 },
        { title: "مساعد ذكي", desc: "استشارات قانونية فورية بالذكاء الاصطناعي", icon: brain_ },
        { title: "صيغ قانونية", desc: "توليد المستندات القانونية تلقائيًا", icon: legal_document_ },
        { title: "حماية البيانات", desc: "تشفير عالي المستوى لجميع معلوماتك", icon: shield_ },
        { title: "سرعة عالية", desc: "أداء فائق وسريع في الاستجابة", icon: barometer_ },
    ];
    return (
        <section id='features-section' className='features-section py-40 overflow-hidden'>
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <HeadTitle
                        title='مميزات'
                        span='محامي سمارت'
                        desc='كل ما تحتاجه لإدارة مكتبك القانوني بكفاءة عالية'
                        position='center'
                    />
                </motion.div>
                <div className="w-full mt-32">
                    <motion.div 
                        className="hidden lg:flex flex-wrap"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {features.map((feature) => (
                            <motion.div 
                                variants={cardVariants}
                                key={feature.title} 
                                className="w-4/12 px-2 mb-8 flex justify-center"
                            >
                                <FeatureCard
                                    title={feature.title}
                                    desc={feature.desc}
                                    icon={feature.icon}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div 
                        className="flex lg:hidden"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <Swiper
                            slidesPerView={3}
                            spaceBetween={30}
                            pagination={{ clickable: true }}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            modules={[Pagination]}
                            className="mySwiper"
                        >
                            {features.map((feature) => (
                                <SwiperSlide key={feature.title}>
                                    <FeatureCard
                                        title={feature.title}
                                        desc={feature.desc}
                                        icon={feature.icon}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};

export default FeaturesSection;