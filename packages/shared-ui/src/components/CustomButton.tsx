import './Buttons.css';
import { Button } from "@heroui/react";


type TCustomButton = {
    type: 'submit' | 'button' | 'reset';
    text: string;
    radius: 'sm' | 'none' | 'md' | 'lg' | 'full';
    // variant: 'solid' | 'faded' | 'bordered' | 'light' | 'flat' | 'ghost' | 'shadow';
    variant?: 'solid' | 'flat' | 'bordered';
    size: 'sm' | 'md' | 'lg';
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
    isLoading?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
}

const CustomButton = ({ type, text = 'العنوان', radius, variant, size, startContent, endContent, color = 'primary', isDisabled, isLoading, fullWidth, onClick }: TCustomButton) => {
    const customStyle = color === 'primary' && (!variant || variant === 'solid') 
        ? { backgroundColor: 'var(--main-color)', color: '#ffffff' } 
        : undefined;

    return (
        <Button 
            className={`font-medium ${customStyle ? 'custom-btn-primary' : ''}`}
            style={customStyle}
            color={color}
            type={type}
            radius={radius}
            variant={variant}
            size={size}
            startContent={startContent}
            endContent={endContent}
            isLoading={isLoading}
            isDisabled={isDisabled}
            fullWidth={fullWidth}
            onClick={onClick}
        >
            {text}
        </Button>
    );
};

export default CustomButton;