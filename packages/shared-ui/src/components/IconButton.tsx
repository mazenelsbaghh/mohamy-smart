import { Button } from "@heroui/react";

type TIconButton = {
    icon: React.ReactNode;
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    onclick?: () => void;
    onClick?: () => void; // support both
    className?: string;
    ariaLabel?: string;
}

const IconButton = ({ icon, radius = "md", size = "md", variant = "solid", color = "default", className = "", onclick, onClick, ariaLabel = "زر" }: TIconButton) => {
    return (
        <Button 
            className={`font-medium ${className}`} 
            isIconOnly 
            aria-label={ariaLabel} 
            radius={radius}
            size={size}
            variant={variant}
            color={color}
            onClick={onClick || onclick}
        >
            {icon}
        </Button>
    );
};

export default IconButton;
