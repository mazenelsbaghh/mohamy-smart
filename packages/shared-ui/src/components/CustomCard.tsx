import React from 'react';
import './Card.css';

interface CustomCardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const CustomCard = ({ children, className, style, onClick }: CustomCardProps) => {
    return (
        <div className={`custom-card p-5 ${className || ''}`} style={style} onClick={onClick}>
            {children}
        </div>
    );
};

export default CustomCard;