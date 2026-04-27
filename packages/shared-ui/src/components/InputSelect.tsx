import { Select, SelectItem } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

export type TInputSelect = {
    label?: string;
    data: string[];
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onValueChange?: (value: string) => void;
    name?: string;
    isDisabled?: boolean;
}

const InputSelect = ({ label = 'العنوان', data, radius, value, isDisabled, onChange, onValueChange, name }: TInputSelect) => {
    const form = useFormContext();
    if (name && form && form.control) {
        return (
            <Controller
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                    <Select className="w-full" label={label}
                        size="sm"
                        radius={radius}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                            const val = Array.from(keys)[0] as string;
                            field.onChange(val);
                        }}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={isDisabled}
                    >
                        {data.map((item) => (
                            <SelectItem key={item}>{item}</SelectItem>
                        ))}
                    </Select>
                )}
            />
        );
    }
    
    return (
        <Select className="w-full" label={label}
            size="sm"
            radius={radius}
            selectedKeys={value ? [value] : undefined}
            value={value}
            onChange={onChange}
            onSelectionChange={onValueChange ? (keys) => {
                const val = Array.from(keys)[0] as string;
                onValueChange(val);
            } : undefined}
            isDisabled={isDisabled}
        >
            {data.map((item) => (
                <SelectItem key={item}>{item}</SelectItem>
            ))}
        </Select>
    );
};

export default InputSelect;
