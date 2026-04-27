import './Inputs.css';
import { Input } from '@heroui/react';
import type { InputProps } from '@heroui/react';

type HeroUIRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

type TCustomInput = InputProps & {
    label?: string | React.ReactNode;
}

const CustomInput = ({ type, label, placeholder, startContent, errorMessage, isInvalid, value, readOnly, variant = "bordered", labelPlacement = "outside", radius = "md", ...rest }: TCustomInput) => {
    if (readOnly) {
        return (
            <Input
                className='custom-input'
                type={type}
                label={label}
                placeholder={placeholder}
                startContent={startContent}
                variant={variant}
                labelPlacement={labelPlacement}
                radius={radius as HeroUIRadius}
                readOnly
            />
        )
    }
    return (
        <Input
            className='custom-input'
            type={type}
            label={label}
            placeholder={placeholder}
            startContent={startContent}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            value={value}
            variant={variant}
            labelPlacement={labelPlacement}
            radius={radius as HeroUIRadius}
            {...rest}
        />
    );
};

export default CustomInput;