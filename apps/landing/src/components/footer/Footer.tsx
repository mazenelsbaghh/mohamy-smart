import './Footer.css';
import Container from '../ui/Container';
import Image from 'next/image';

import logo from '../../../public/images/logo.png';



import { FaTiktok } from "react-icons/fa6";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className='py-30'>
            <Container>
                <div className="footer-frame">
                    <div className="logo mb-3">
                        <Image src={logo} alt='logo' />
                        {/* <p>قانوني للتكنولوجيا الذكيه - EGY Legal for smart technology</p> */}
                    </div>
                    <ul className='mb-3'>
                        <li>
                            <a href="#hero-section">الرئيسية</a>
                        </li>
                        <li>
                            <a href="#features-section">المميزات</a>
                        </li>
                        <li>
                            <a href="#who-we-are-section">من نحن</a>
                        </li>
                        <li>
                            <a href="#how-to-use-section">طريقة الاستخدام</a>
                        </li>
                        <li>
                            <a href="#pricing-plans">الباقات</a>
                        </li>
                        <li>
                            <a href="#testimonials-section">اراء العملاء</a>
                        </li>
                        <li>
                            <a href="#contact-section">تواصل معنا</a>
                        </li>
                    </ul>
                    <div className="social-media mb-3">
                        <a href='https://www.instagram.com/mohamysmart?igsh=MXRtNXNrdzhmbXo1aA==' target='_blank' rel="noopener noreferrer" aria-label="تابعنا على انستغرام" className="icon">
                            <FaInstagram aria-hidden="true" />
                        </a>
                        <a href='https://www.tiktok.com/@mohamysmart?_r=1&_t=ZS-93wpRamDvvA' target='_blank' rel="noopener noreferrer" aria-label="تابعنا على تيك توك" className="icon">
                            <FaTiktok aria-hidden="true" />
                        </a>
                        <a href='https://www.facebook.com/share/1B8cv3VtWj/?mibextid=wwXIfr' target='_blank' rel="noopener noreferrer" aria-label="تابعنا على فيسبوك" className="icon">
                            <FaFacebook aria-hidden="true" />
                        </a>
                    </div>


                    <div className="w-full flex flex-col justify-center items-center mt-5">
                        <p>قانوني للتكنولوجيا الذكيه - EGY Legal for smart technology</p>
                        <ul className='mt-3'>
                            <li><Link href={'/about'}>من نحن</Link></li>
                            <li><Link href={'/faq'}>الأسئلة الشائعة</Link></li>
                            <li><Link href={'/privacy-policy'}>سياسة الخصوصية</Link></li>
                            <li><Link href={'/refund-policy'}>سياسة الاسترداد والإلغاء</Link></li>
                        </ul>
                    </div>
                    {/* <div className="copyright w-full mt-5">
                        جميع الحقوق محفوظة © 2025 , CodeCept | صنع بكل حب 💙 تنفيذ و تطوير CodeCept
                    </div> */}
                </div>
            </Container>
        </footer>
    );
};

export default Footer;