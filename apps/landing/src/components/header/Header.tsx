'use client'
import Image from 'next/image';
import './Header.css';
import { useState } from 'react';
import MenuButton from '../ui/menuButton/MenuButton';
import { IoArrowBackOutline } from "react-icons/io5";
import logo from '../../../public/images/logo.png'


const Header = () => {
    const [openNav, setOpenNav] = useState<boolean>(false);
    return (
        <header className={`px-14 md:px-32  ${openNav && 'show-arrow'}`}>
            <div className="logo">
                <Image src={logo} alt='logo' priority />
            </div>

            <nav className={`${openNav && 'open-nav'}`}>
                <ul>
                    <li>
                        <a href="#hero-section">الصفحة الرئيسية</a>
                    </li>
                    <li>
                        <a href="#features-section">المميزات</a>
                    </li>
                    <li>
                        <a href="#about-section">من نحن</a>
                    </li>
                    <li>
                        <a href="#who-we-are-section">محامي سمارت</a>
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
                        <a href="#contact-section">تواصل معانا</a>
                    </li>
                </ul>
            </nav>

            <div className='flex items-center gap-3'>
                <div className="menu-button-box">
                    <MenuButton openNav={openNav} setOpenNav={setOpenNav} />
                </div>

                <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078'}/auth/login`} className='login-btn'>
                    تسجيل الدخول
                </a>

                <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078'}/auth/sign-up`} className='main-btn'>
                    سجل معانا
                    <IoArrowBackOutline aria-hidden="true" />
                </a>
            </div>
        </header>
    );
};

export default Header;