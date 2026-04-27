import dynamic from 'next/dynamic';
import Header from '@/components/header/Header';
import WhoWeAreSection from '@/components/whoWeAreSection/WhoWeAreSection';
import PricingPlans from '@/components/pricingPlans/PricingPlans';
import TestimonialsSection from '@/components/testimonialsSection/TestimonialsSection';
import ContactSection from '@/components/contactSection/ContactSection';
import CallToAction from '@/components/callToAction/CallToAction';
import Footer from '@/components/footer/Footer';
import AboutSection from '@/components/aboutSection/AboutSection';

const HeroSection = dynamic(() => import('@/components/heroSection/HeroSection'));
const FeaturesSection = dynamic(() => import('@/components/featuresSection/FeaturesSection'));
const HowToUseSection = dynamic(() => import('@/components/howToUseSection/HowToUseSection'));
const FaqSection = dynamic(() => import('@/components/faqSection/FaqSection'));



export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <WhoWeAreSection />
      <HowToUseSection />
      <PricingPlans />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
      <CallToAction />
      <Footer />
    </main>
  );
};