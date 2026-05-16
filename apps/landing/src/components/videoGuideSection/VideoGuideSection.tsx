'use client';

import { motion } from 'framer-motion';
import Container from '../ui/Container';
import HeadTitle from '../headTitle/HeadTitle';
import './VideoGuideSection.css';

const VIDEO_URL = 'https://www.youtube.com/embed/RLO_qRNAu0s?rel=0&modestbranding=1';

const chapters = [
  'تسجيل الدخول والتعرف على لوحة التحكم',
  'تشغيل المحادثة الذكية والأجندة القضائية',
  'رفع المستندات وتوليد قضية',
  'التحليل الذكي، الموكلين، العقود، والمكتبة القانونية',
];

const VideoGuideSection = () => {
  return (
    <section id="video-guide-section" className="video-guide-section py-32">
      <Container>
        <div className="video-guide-section__layout">
          <motion.div
            className="video-guide-section__copy"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeadTitle
              title="شرح سريع"
              span="لمنصة محامي سمارت"
              position="start"
              desc="شاهد الجولة الكاملة مرة واحدة، ثم ستجد داخل لوحة التحكم مقاطع قصيرة تبدأ من الجزء المناسب لكل صفحة."
            />

            <ul className="video-guide-section__chapters" aria-label="محتوى الفيديو">
              {chapters.map((chapter) => (
                <li key={chapter}>{chapter}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="video-guide-section__player"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <iframe
              src={VIDEO_URL}
              title="شرح منصة محامي سمارت"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default VideoGuideSection;
