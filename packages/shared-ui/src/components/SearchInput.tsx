import { Input, type InputProps } from '@heroui/react';
import { FiSearch } from 'react-icons/fi';

export interface SearchInputProps extends Omit<InputProps, 'startContent'> {
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
}

const SearchInput = ({ placeholder = "ابحث...", value, onValueChange, className, ...props }: SearchInputProps) => {
    return (
        <Input
            placeholder={placeholder}
            startContent={<FiSearch className="text-gray-400" />}
            value={value}
            onValueChange={onValueChange}
            className={`flex-1 min-w-[230px] max-w-[320px] ${className || ''}`}
            variant="bordered"
            size="md"
            isClearable
            onClear={() => onValueChange('')}
            classNames={{
                inputWrapper: "bg-white/50 dark:bg-[#161616]/50 backdrop-blur-md border border-gray-200/50 dark:border-white/10 hover:border-[var(--main-color)] focus-within:!border-[var(--main-color)] rounded-xl",
            }}
            {...props}
        />
    );
};

export default SearchInput;
