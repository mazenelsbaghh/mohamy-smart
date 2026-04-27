import dynamic from 'next/dynamic';
import Header from '@/components/header/Header';
import HeroSection from '@/components/heroSection/HeroSection';

const WhoWeAreSection = dynamic(() => import('@/components/whoWeAreSection/WhoWeAreSection'));
const PricingPlans = dynamic(() => import('@/components/pricingPlans/PricingPlans'));
const TestimonialsSection = dynamic(() => import('@/components/testimonialsSection/TestimonialsSection'));
const ContactSection = dynamic(() => import('@/components/contactSection/ContactSection'));
const CallToAction = dynamic(() => import('@/components/callToAction/CallToAction'));
const Footer = dynamic(() => import('@/components/footer/Footer'));
const AboutSection = dynamic(() => import('@/components/aboutSection/AboutSection'));
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