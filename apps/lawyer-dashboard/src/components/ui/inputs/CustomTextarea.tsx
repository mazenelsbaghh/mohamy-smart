import { Textarea } from"@heroui/react";
import type { ComponentProps } from"react";


type TCustomTextarea = ComponentProps<typeof Textarea> & {
	 label: string;
	 placeholder: string;
	 variant:'flat' |'faded' |'bordered';
	}

const CustomTextarea = ({ label, placeholder, variant,rows, readOnly, value, onChange, isInvalid, errorMessage, ...rest }: TCustomTextarea) => {
 return (
 <Textarea
 disableAnimation
 disableAutosize
 classNames={{
 base:"w-full",
 input:"resize-y min-h-[80px]",
 }}
 rows={rows}
 label={label}
 placeholder={placeholder}
 variant={variant}
 readOnly={readOnly}
 value={value}
 onChange={onChange}
 isInvalid={isInvalid}
 errorMessage={errorMessage}
 {...rest}
 />
 )
}

export default CustomTextarea
