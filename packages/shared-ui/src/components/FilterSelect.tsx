import { Select, SelectItem, type SelectProps } from '@heroui/react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterSelectProps extends Omit<SelectProps, 'children'> {
    placeholder?: string;
    options: FilterOption[];
    onSelectionChange?: (value: unknown) => void;
}

const FilterSelect = ({
    placeholder = "تصفية...",
    options,
    className,
    onSelectionChange,
    ...props
}: FilterSelectProps) => {
    return (
        <Select
            placeholder={placeholder}
            variant="bordered"
            size="md"
            aria-label={placeholder}
            onSelectionChange={onSelectionChange}
            className={`min-w-[150px] sm:min-w-[200px] ${className || ''}`}
            classNames={{
                trigger: "bg-white/50 dark:bg-[#161616]/50 backdrop-blur-md border border-gray-200/50 dark:border-white/10 hover:border-[var(--main-color)] data-[open=true]:!border-[var(--main-color)] rounded-xl",
                listbox: "text-[var(--text-color)]",
                popoverContent: "bg-white/90 dark:bg-[#161616]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10",
            }}
            {...props}
        >
            {options.map((option) => (
                <SelectItem key={option.value}>
                    {option.label}
                </SelectItem>
            ))}
        </Select>
    );
};

export default FilterSelect;
