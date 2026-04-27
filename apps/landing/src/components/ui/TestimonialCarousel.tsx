'use client';

import { IoIosStar } from "react-icons/io";
import { User } from '@heroui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay } from 'swiper/modules';

export type Testimonial = {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="testimonial-card">
        <div className="flex flex-wrap justify-between">
            <User
                description={testimonial.role}
                name={testimonial.name}
                className='mb-4'
            />
            <div className="rating mb-4" aria-label={`تقييم ${testimonial.rating} من 5`}>
                <div className="stars" aria-hidden="true" style={{ display: 'flex' }}>
                    {Array.from({ length: testimonial.rating }, (_, idx) => (
                        <IoIosStar key={idx} />
                    ))}
                </div>
                <span className="sr-only" aria-hidden="true">{testimonial.rating}</span>
            </div>
        </div>
        <p className="text-end">{testimonial.text}</p>
    </div>
);

const swiperBreakpoints = {
    320: { slidesPerView: 1, spaceBetween: 10 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    1000: { slidesPerView: 3, spaceBetween: 20 },
    1700: { slidesPerView: 4, spaceBetween: 30 },
};

interface TestimonialCarouselProps {
    testimonials: Testimonial[];
    reduceMotion?: boolean;
    speed?: number;
    reverseDirection?: boolean;
    ariaLabel?: string;
}

export const TestimonialCarousel = ({
    testimonials,
    reduceMotion = false,
    speed = 5000,
    reverseDirection = false,
    ariaLabel
}: TestimonialCarouselProps) => {
    return (
        <Swiper
            slidesPerView={3}
            spaceBetween={30}
            loop={!reduceMotion}
            speed={speed}
            autoplay={reduceMotion ? false : { delay: 0, disableOnInteraction: false, reverseDirection }}
            breakpoints={swiperBreakpoints}
            modules={[Autoplay]}
            className="mySwiper"
            aria-label={ariaLabel}
        >
            {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id} className='p-4 h-auto'>
                    <TestimonialCard testimonial={testimonial} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
