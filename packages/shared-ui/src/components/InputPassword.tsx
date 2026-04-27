import { useState } from "react";
import { Input } from "@heroui/react";

import { RxEyeClosed } from "react-icons/rx";
import { FaRegEye } from "react-icons/fa";
import type { InputProps } from '@heroui/react';

type TInputPassword = InputProps & {
    label: string;
    toggleIconPlacement?: "start" | "end";
}

const InputPassword = ({ 
    label, 
    isInvalid, 
    errorMessage, 
    placeholder, 
    variant = "bordered", 
    labelPlacement = "outside", 
    toggleIconPlacement = "end", 
    className = "",
    ...rest 
}: TInputPassword) => {

    const [isVisible, setIsVisible] = useState<boolean>(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const toggleButton = (
        <button
            aria-label="toggle password visibility"
            className="focus:outline-solid outline-transparent cursor-pointer"
            type="button"
            onClick={toggleVisibility}
        >
            {isVisible ? (
                <FaRegEye className="text-2xl text-default-400 pointer-events-none" />
            ) : (
                <RxEyeClosed className="text-2xl text-default-400 pointer-events-none" />
            )}
        </button>
    );

    return (
        <Input
            className={`custom-input ${className}`}
            type={isVisible ? "text" : "password"}
            label={label}
            placeholder={placeholder}
            errorMessage={errorMessage}
            isInvalid={isInvalid}
            variant={variant}
            labelPlacement={labelPlacement}
            startContent={toggleIconPlacement === "start" ? toggleButton : undefined}
            endContent={toggleIconPlacement === "end" ? toggleButton : undefined}
            {...rest}
        />
    );
}

export default InputPassword;
