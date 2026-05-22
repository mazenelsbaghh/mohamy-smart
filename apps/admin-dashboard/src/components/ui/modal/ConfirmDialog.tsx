import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from'@heroui/react';
import { IoTrashOutline, IoAlertCircleOutline } from 'react-icons/io5';

type ConfirmDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    isLoading?: boolean;
};

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    danger = false,
    isLoading = false,
}: ConfirmDialogProps) => {
    const IconComponent = danger ? IoTrashOutline : IoAlertCircleOutline;
    const iconBg = danger ? 'var(--danger-soft)' : 'var(--accent-soft)';
    const iconColor = danger ? 'var(--danger-color)' : 'var(--main-color)';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            backdrop="blur"
            size="md"
            classNames={{
                base: 'backdrop-blur-2xl bg-white/70 dark:bg-[#161616]/70 border border-white/30 dark:border-white/10 shadow-2xl',
                backdrop: 'bg-[#1b1b1b]/20 backdrop-blur-sm',
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 pb-0" dir="rtl">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: iconBg }}
                        >
                            <IconComponent className="text-xl" style={{ color: iconColor }} />
                        </div>
                        <span className="text-base font-bold text-[var(--title-color)]">{title}</span>
                    </div>
                </ModalHeader>
                {description && (
                    <ModalBody dir="rtl">
                        <p className="text-sm app-text-muted leading-relaxed">{description}</p>
                    </ModalBody>
                )}
                <ModalFooter dir="rtl" className="flex gap-2 justify-end pt-2">
                    <Button
                        variant="flat"
                        onPress={onClose}
                        isDisabled={isLoading}
                        className="font-bold text-sm bg-white/50 dark:bg-white/10 text-[var(--title-color)] border border-white/40 dark:border-white/10 backdrop-blur-md"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onPress={onConfirm}
                        isLoading={isLoading}
                        className={`font-bold text-sm text-white ${
                            danger
                                ? 'bg-[var(--danger-color)] hover:opacity-90'
                                : 'bg-[var(--main-color)] hover:opacity-90'
                        }`}
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmDialog;
