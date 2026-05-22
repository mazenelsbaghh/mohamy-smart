import { Modal, ModalContent, ModalHeader, ModalBody } from"@heroui/react";
import type { ReactNode } from"react";

type FormModalProps = {
 isOpen: boolean;
 /** Pass onClose for direct close handling */
 onClose?: () => void;
 /** Pass onOpenChange when using HeroUI's useDisclosure */
 onOpenChange?: (isOpen: boolean) => void;
 title: string;
 subtitle?: ReactNode;
 icon?: ReactNode;
 iconBg?: string;
 size?:"sm" |"md" |"lg" |"xl" |"2xl" |"3xl" |"4xl" | "full";
 children: ReactNode;
};

/**
 * Standard brand-styled modal for all form dialogs.
 * - Cream header (#FBFAE8) with optional icon + title + subtitle
 * - Blurred backdrop, rounded-3xl, brand border accent
 * - Accepts onClose (direct) or onOpenChange (useDisclosure)
 */
const FormModal = ({
 isOpen,
 onClose,
 onOpenChange,
 title,
 subtitle,
 icon,
 iconBg ="var(--main-color)",
 size ="lg",
 children,
}: FormModalProps) => {
 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 onOpenChange={onOpenChange}
 size={size}
 scrollBehavior="inside"
 backdrop="blur"
 placement="center"
 classNames={{
 base: "rounded-3xl overflow-hidden app-surface border app-border mx-4 my-4 max-h-[90dvh]",
 header:"p-0 border-b-0",
 body:"p-0 app-surface",
 wrapper: "items-center",
 }}
 >
 <ModalContent>
 <ModalHeader dir="rtl">
 <div className="w-full app-surface-soft px-6 py-5 flex items-center gap-3 border-b app-border">
 {icon && (
 <span
 className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm"
 style={{ backgroundColor: iconBg }}
 >
 {icon}
 </span>
 )}
 <div dir="rtl">
 <p className="text-[var(--title-color)] font-semibold text-base leading-tight">
 {title}
 </p>
 {subtitle && (
 <div className="app-text-muted text-xs mt-0.5">{subtitle}</div>
 )}
 </div>
 </div>
 </ModalHeader>
 <ModalBody>{children}</ModalBody>
 </ModalContent>
 </Modal>
 );
};

export default FormModal;
