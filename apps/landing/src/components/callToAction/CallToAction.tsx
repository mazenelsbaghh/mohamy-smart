import './CallToAction.css';
import Container from '../ui/Container';
import { IoArrowBack } from "react-icons/io5";


const CallToAction = () => {
    return (
        <section className='call-to-action py-40' aria-label="دعوة للعمل">
            <Container>
                <div className="call-to-action-frame">
                    <h3>لا حدود لتحليلك وفهمك القانوني ابدأ رحلتك الذكية مع سمارت محامي.</h3>
                    <a
                        href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078'}/auth/sign-up`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-btn"
                    >
                        ابدأ تجربتك المجانية الآن
                        <IoArrowBack aria-hidden="true" />
                    </a>
                </div>
            </Container>
        </section>
    )
}

export default CallToAction