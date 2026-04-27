import './ContactSection.css';
import Container from '../ui/Container';
import ContactForm from '../ui/forms/ContactForm';

import { TfiEmail } from "react-icons/tfi";
import { SlLocationPin } from "react-icons/sl";

import Image from 'next/image';

import map from '../../../public/images/World Card.png';



const ContactSection = () => {
    return (
        <section id='contact-section' className='contact-section py-40'>
            <Container>
                <div className="contact-frame py-4 px-8">
                    <div className="flex flex-col-reverse flex-wrap md:flex-row">
                        <div className="w-full md:w-6/12 mb-8">
                            <h3>تواصل معنا</h3>
                            <p>هل عندك استفسار؟ محتاج مساعدة؟ ابعتلنا رسالتك وهنتواصل معاك بسرعة.</p>
                            <ul className='flex gap-10'>
                                <li>
                                    <TfiEmail aria-hidden="true" />
                                    <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'Info@mohamy-smart.com'}`}>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'Info@mohamy-smart.com'}</a>
                                </li>
                                <li>
                                    <SlLocationPin aria-hidden="true" />
                                    زرنا
                                    الاسكندرية ، مصر
                                </li>
                            </ul>

                            <ContactForm />
                        </div>

                        <div className="w-full md:w-6/12 mb-8">
                            <div className="map-image">
                                <Image src={map} alt='map image' />
                                <div className="map-card">
                                    <h4>Alexandria, Egypt</h4>
                                    <a href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+201289221056'}`}>{process.env.NEXT_PUBLIC_SUPPORT_PHONE || '01289221056'}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default ContactSection;