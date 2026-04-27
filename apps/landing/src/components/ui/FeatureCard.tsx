import Image, { StaticImageData } from 'next/image';
import './FeatureCard.css';

type TFeatureCard = {
    title: string;
    desc: string;
    icon: StaticImageData;
};

const FeatureCard = ({ title, desc, icon }: TFeatureCard) => {
    return (
        <div className="feature-card">
            <div className="img">
                <Image src={icon} alt="" aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
};

export default FeatureCard;
